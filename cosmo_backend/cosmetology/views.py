from rest_framework.views import APIView
from rest_framework.response import Response
from pymongo import MongoClient
from gridfs import GridFS
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework import status
from datetime import datetime, timedelta
from django.utils import timezone
import json
from decimal import Decimal

from .serializers import RegisterSerializer
@api_view(['POST'])
@csrf_exempt
def registration(request):
    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

from .models import Register
@api_view(['POST'])
@csrf_exempt
def login(request):
    if request.method == 'POST':
        username = request.data.get('username')
        password = request.data.get('password')
        endpoint = request.data.get('endpoint')

        try:
            user = Register.objects.get(email=username, password=password)

            # Check if the user is a doctor
            if user.role == 'Doctor':
                return Response({'message': 'Login successful', 'role': user.role, 'id': user.id, 'name': user.name, 'email': user.email}, status=status.HTTP_200_OK)

            # Check if the role matches the endpoint
            if endpoint == 'DoctorLogin' and user.role != 'Doctor':
                return Response('Access denied', status=status.HTTP_403_FORBIDDEN)
            elif endpoint == 'PharmacistLogin' and user.role != 'Pharmacist':
                return Response('Access denied', status=status.HTTP_403_FORBIDDEN)
            elif endpoint == 'ReceptionistLogin' and user.role != 'Receptionist':
                return Response('Access denied', status=status.HTTP_403_FORBIDDEN)

            return Response({'message': 'Login successful', 'role': user.role, 'id': user.id, 'name': user.name, 'email': user.email}, status=status.HTTP_200_OK)
        except Register.DoesNotExist:
            return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)
        

from .serializers import PharmacySerializer
import logging
logger = logging.getLogger(__name__)

@api_view(['GET', 'POST', 'PUT'])
def pharmacy_data(request):
    if request.method == 'GET':
        medicines = Pharmacy.objects.all()
        serializer = PharmacySerializer(medicines, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = PharmacySerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'PUT':
        response_data = []
        client = MongoClient('mongodb+srv://smrftcosmo:smrft%402024@cluster0.lctyiq9.mongodb.net/?retryWrites=true&w=majority')
        db = client['cosmetology']
        pharmacy_collection = db.cosmetology_pharmacy

        # Clear existing data
        pharmacy_collection.delete_many({})

        for data in request.data:
            medicine_name = data.get('medicine_name')
            batch_number = data.get('batch_number')
            try:
                # Update or upsert the document in MongoDB
                result = pharmacy_collection.update_one(
                    {'medicine_name': medicine_name, 'batch_number': batch_number},
                    {'$set': data},
                    upsert=True
                )
                if result.upserted_id or result.modified_count > 0:
                    response_data.append(data)
                else:
                    logger.error(f"Failed to update document with medicine_name={medicine_name} and batch_number={batch_number}")
                    return Response({'error': 'Failed to update the document.'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Unexpected error for medicine_name={medicine_name} and batch_number={batch_number}: {e}")
                return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        return Response(response_data, status=status.HTTP_200_OK)


from django.views.decorators.http import require_http_methods
@require_http_methods(["DELETE"])
@csrf_exempt
def delete_medicine(request, medicine_name):
    try:
        medicine = Pharmacy.objects.get(medicine_name=medicine_name)
        medicine.delete()
        return JsonResponse({"message": "Medicine deleted successfully."}, status=200)
    except Pharmacy.DoesNotExist:
        return JsonResponse({"error": "Medicine not found."}, status=404)


from .serializers import PharmacyStockUpdateSerializer
@api_view(['PUT'])
def update_stock(request):
    if request.method == 'PUT':
        data = request.data
        medicine_name = data.get('medicine_name')
        qty = data.get('qty')
        if not medicine_name or qty is None:
            return Response({'error': 'Invalid data. Medicine name and quantity are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            qty = int(qty)  # Ensure qty is an integer
            # Correct MongoDB connection string
            client = MongoClient('mongodb+srv://smrftcosmo:smrft%402024@cluster0.lctyiq9.mongodb.net/your_database_name?retryWrites=true&w=majority')
            db = client['cosmetology']
            pharmacy_collection = db.cosmetology_pharmacy
            # Find the document by medicine_name
            document = pharmacy_collection.find_one({'medicine_name': medicine_name})
            if not document:
                return Response({'error': 'Medicine not found'}, status=status.HTTP_404_NOT_FOUND)
            old_stock = document.get('old_stock', 0)
            new_stock = old_stock - qty
            if new_stock < 0:
                return Response({'error': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
            # Update the stock
            result = pharmacy_collection.update_one(
                {'medicine_name': medicine_name},
                {'$set': {'old_stock': new_stock}}
            )
            if result.matched_count == 0:
                return Response({'error': 'Failed to update stock'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'message': 'Stock updated successfully'}, status=status.HTTP_200_OK)
        except ValueError:
            return Response({'error': 'Invalid quantity value'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def pharmacy_upload(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        # Handle file upload logic here
        return Response({'message': 'File uploaded successfully'}, status=status.HTTP_201_CREATED)
    return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)


from .models import Pharmacy
@api_view(['GET'])
def check_medicine_status(request):
    low_quantity_medicines = []
    near_expiry_medicines = []

    medicines = Pharmacy.objects.all()

    for medicine in medicines:
        if medicine.is_quantity_low():
            low_quantity_medicines.append(medicine)
        if medicine.is_expiry_near():
            near_expiry_medicines.append(medicine)

    response_data = {
        'low_quantity_medicines': PharmacySerializer(low_quantity_medicines, many=True).data,
        'near_expiry_medicines': PharmacySerializer(near_expiry_medicines, many=True).data,
    }

    return Response(response_data, status=status.HTTP_200_OK)



from .serializers import PatientSerializer
@api_view(['POST'])
def Patients_data(request):
    if request.method == 'POST':
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from .models import Patient
@api_view(['GET'])
def PatientView(request):
    if request.method == 'GET':
        medicines = Patient.objects.all()
        serializer = PatientSerializer(medicines, many=True)
        return Response(serializer.data)
    

from .serializers import AppointmentSerializer
@api_view(['POST'])
@csrf_exempt
def Appointmentpost(request):
    if request.method == 'POST':
        patient_uid = request.data.get('patientUID')
        appointment_date = request.data.get('appointmentDate')
        
        try:
            patient = Patient.objects.get(patientUID=patient_uid)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)
        except Patient.MultipleObjectsReturned:
            return Response({"error": "Multiple patients found"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the patient already has an appointment on the given date
        existing_appointment = Appointment.objects.filter(patientUID=patient_uid, appointmentDate=appointment_date).first()
        if existing_appointment:
            return Response({"error": f"Patient already has an appointment on {appointment_date}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add patient details to the request data
        request.data['purposeOfVisit'] = patient.purposeOfVisit
        request.data['gender'] = patient.gender
        
        # Serialize and save the new appointment
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

from .models import Appointment    
@api_view(['GET'])
def AppointmentView(request):
    if request.method == 'GET':
        data = Appointment.objects.all()
        serializer = AppointmentSerializer(data, many=True)
        return Response(serializer.data)
    

from .models import SummaryDetail
from .serializers import SummaryDetailSerializer
from datetime import datetime
@api_view(['POST', 'GET'])
def SummaryDetailCreate(request):
    if request.method == 'POST':
        try:
            serializer = SummaryDetailSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'GET':
        try:
            date_str = request.GET.get('appointmentDate')
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            
            # Query SummaryDetail objects based on the specified date
            summaries = SummaryDetail.objects.filter(appointmentDate=date)
            
            # Serialize the queryset
            serializer = SummaryDetailSerializer(summaries, many=True)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

@api_view(['GET'])
def PatientDetailsView(request):
    try:
        date_str = request.GET.get('appointmentDate')
        if date_str is None:
            return Response({'error': 'Date parameter is missing'}, status=status.HTTP_400_BAD_REQUEST)
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        # Query SummaryDetail objects based on the specified date
        summaries = SummaryDetail.objects.filter(appointmentDate=date)
        # Serialize the queryset
        serializer = SummaryDetailSerializer(summaries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except ValueError:
        return Response({'error': 'Invalid date format. Expected YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def get_medicine_price(request):
    try:
        medicine_name = request.GET.get('medicine_name')
        # Fetch the medicine details from your database
        medicine = Pharmacy.objects.get(medicine_name=medicine_name)
        # Prepare the response data
        response_data = {
            'medicine_name': medicine.medicine_name,
            'company_name': medicine.company_name,
            'price': str(Decimal(medicine.price)),
            'CGST_percentage': medicine.CGST_percentage,
            'CGST_value': medicine.CGST_value,
            'SGST_percentage': medicine.SGST_percentage,
            'SGST_value': medicine.SGST_value,
            'new_stock': medicine.new_stock,
            'old_stock': medicine.old_stock,
            'received_date': medicine.received_date,
            'expiry_date': medicine.expiry_date,
            'batch_number': medicine.batch_number,
        }
        # Return JSON response
        return Response(response_data, status=status.HTTP_200_OK)
    except Pharmacy.DoesNotExist:
        return Response({'error': f'Medicine "{medicine_name}" not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@csrf_exempt
def check_upcoming_visits(request):
    one_week_from_now = timezone.now().date() + timedelta(days=7)
    upcoming_visits = SummaryDetail.objects.all()
    filtered_visits = []

    for visit in upcoming_visits:
        try:
            next_visit_date = datetime.strptime(visit.nextVisit, '%d/%m/%Y').date()
            if timezone.now().date() <= next_visit_date <= one_week_from_now:
                filtered_visits.append({
                    'patientUID': visit.patientUID,
                    'patientName': visit.patientName,
                    'nextVisit': visit.nextVisit
                })
        except ValueError:
            continue

    data = {
        'upcoming_visits': filtered_visits
    }

    return JsonResponse(data)


from .serializers import VitalSerializer
from .models import Vital
@api_view(['POST', 'GET'])
@csrf_exempt
def vitalform(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        vital = Vital.objects.create(
            patientUID=data.get('patientUID'),
            patientName=data.get('patientName'),
            mobileNumber=data.get('mobileNumber'),
            height=data.get('height'),
            weight=data.get('weight'),
            pulseRate=data.get('pulseRate'),
            bloodPressure=data.get('bloodPressure')
        )
        serializer = VitalSerializer(vital)
        return Response({'status': 'success', 'vital': serializer.data})
    elif request.method == 'GET':
        patientUID = request.GET.get('patientUID')
        vitals = Vital.objects.filter(patientUID=patientUID)
        serializer = VitalSerializer(vitals, many=True)
        return Response({'status': 'success', 'vital': serializer.data})
    

from .models import Diagnosis,Complaints,Findings,Tests,Procedure
from .serializers import DiagnosisSerializer,ComplaintsSerializer,FindingsSerializer,TestsSerializer,ProcedureSerializer
@api_view(['GET', 'POST'])
def diagnosis_list(request):
    if request.method == 'GET':
        # Fetch all diagnoses from the database
        diagnoses = Diagnosis.objects.all()
        serializer = DiagnosisSerializer(diagnoses, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Deserialize the data
        serializer = DiagnosisSerializer(data=request.data)
        if serializer.is_valid():
            # Save the new diagnosis to the database
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET', 'POST'])
def Complaints_list(request):
    if request.method == 'GET':
        # Fetch all diagnoses from the database
        complaints = Complaints.objects.all()
        serializer = ComplaintsSerializer(complaints, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Deserialize the data
        serializer = ComplaintsSerializer(data=request.data)
        if serializer.is_valid():
            # Save the new diagnosis to the database
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET', 'POST'])
def Findings_list(request):
    if request.method == 'GET':
        # Fetch all diagnoses from the database
        findings = Findings.objects.all()
        serializer = FindingsSerializer(findings, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Deserialize the data
        serializer = FindingsSerializer(data=request.data)
        if serializer.is_valid():
            # Save the new diagnosis to the database
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET', 'POST'])
def Tests_list(request):
    if request.method == 'GET':
        # Fetch all diagnoses from the database
        tests = Tests.objects.all()
        serializer = TestsSerializer(tests, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Deserialize the data
        serializer = TestsSerializer(data=request.data)
        if serializer.is_valid():
            # Save the new diagnosis to the database
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET', 'POST'])
def Procedure_list(request):
    if request.method == 'GET':
        # Fetch all diagnoses from the database
        procedure = Procedure.objects.all()
        serializer = ProcedureSerializer(procedure, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Deserialize the data
        serializer = ProcedureSerializer(data=request.data)
        if serializer.is_valid():
            # Save the new diagnosis to the database
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

from .models import BillingData
from .serializers import BillingDataSerializer
from django.views.decorators.http import require_GET
client = MongoClient('mongodb+srv://smrftcosmo:smrft%402024@cluster0.lctyiq9.mongodb.net/your_database_name?retryWrites=true&w=majority')
db = client['cosmetology']
collection = db['cosmetology_billingdata']
@api_view(['POST'])
@csrf_exempt
def save_billing_data(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            patientUID = data.get('patientUID')
            patientName = data.get('patientName')
            date = data.get('appointmentDate')
            table_data = data.get('table_data')  # Ensure this is a valid JSON object
            netAmount = data.get('netAmount')
            discount = data.get('discount')
            payment_type = data.get('paymentType')  # Cash or Card
            section = data.get('section')  # Section: Pharmacy, Consumer, Procedure

            if not date:
                return JsonResponse({'error': 'Date is required.'}, status=400)
            
            # Validate table_data as a JSON object
            if isinstance(table_data, str):
                table_data = json.loads(table_data)

            # Generate the serial number based on payment type and section
            bill_number = generate_serial_number(payment_type, section)
            
            # Create a new BillingData entry
            billing_data = BillingData(
                patientUID=patientUID,
                patientName=patientName,
                appointmentDate=date,
                table_data=table_data,  # Store as JSON object, not string
                netAmount=netAmount,
                discount=discount,
                paymentType=payment_type,
                billNumber=bill_number
            )
            billing_data.save()

            return JsonResponse({'success': 'Billing data successfully saved!', 'serialNumber': bill_number}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method.'}, status=405)

def generate_serial_number(payment_type, section):
        current_year = timezone.now().year  # Get the current year
        prefix = ''
        
        if payment_type == 'Cash':
            if section == 'Pharmacy':
                prefix = 'CPhar'
            elif section == 'Consumer':
                prefix = 'CCosu'
            elif section == 'Procedure':
                prefix = 'CProc'
        elif payment_type == 'Card':
            if section == 'Pharmacy':
                prefix = 'Phar'
            elif section == 'Consumer':
                prefix = 'Cosu'
            elif section == 'Procedure':
                prefix = 'Proc'

        # Query the last serial number for the same type and section
        last_bill = BillingData.objects.filter(paymentType=payment_type, billNumber__startswith=prefix).order_by('-id').first()
        
        if last_bill:
            # Extract the last sequence number and increment it
            last_serial = last_bill.billNumber.split('/')[-1]
            new_sequence = int(last_serial) + 1
        else:
            # Start the sequence at 001 if no previous serial number is found
            new_sequence = 1

        # Format the serial number as per the pattern
        bill_number = f"{prefix}/{current_year}/{new_sequence:03d}"
        return bill_number


@api_view(['PUT'])
@csrf_exempt
def update_billing_data(request):
    try:
        patientUID = request.data.get('patientUID')
        date = request.data.get('appointmentDate')
        table_data = request.data.get('table_data')

        if not patientUID or not date or not table_data:
            return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate table_data as a JSON object
        if isinstance(table_data, str):
            table_data = json.loads(table_data)

        # Find and update the record
        result = collection.find_one_and_update(
            {'patientUID': patientUID, 'appointmentDate': date},
            {'$set': {'table_data': table_data}},  # Update table_data with JSON object
            return_document=True
        )

        if result:
            return Response({'message': 'Data updated successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Data not found'}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


logger = logging.getLogger(__name__)

@require_http_methods(["DELETE"])
@csrf_exempt
def delete_billing_data(request):
    logger.info(f"Request method: {request.method}")
    if request.method == 'DELETE':
        try:
            data = json.loads(request.body.decode('utf-8'))
            record_id = data.get('record_id')  # Use a unique identifier

            if not record_id:
                return JsonResponse({'message': 'Missing record_id'}, status=400)

            # Delete the specific record using the unique identifier
            BillingData.objects.filter(patientUID=record_id).delete()
            return JsonResponse({'message': 'Data deleted successfully'}, status=200)
        except Exception as e:
            logger.error(f"Error occurred: {str(e)}")
            return JsonResponse({'message': str(e)}, status=400)
    return JsonResponse({'message': 'Method not allowed'}, status=405)


@api_view(['GET'])
@csrf_exempt
def get_summary_by_interval(request, interval):
    date_str = request.GET.get('appointmentDate')
    if not date_str:
        return JsonResponse({'error': 'Date parameter is missing'}, status=400)

    try:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'error': 'Invalid date format'}, status=400)

    if interval == 'day':
        start_date = selected_date
        end_date = selected_date
    elif interval == 'month':
        start_date = selected_date.replace(day=1)
        # Determine the end of the month
        next_month = (start_date + timedelta(days=31)).replace(day=1)
        end_date = next_month - timedelta(days=1)
    else:
        return JsonResponse({'error': 'Invalid interval'}, status=400)

    summaries = SummaryDetail.objects.filter(appointmentDate__range=(start_date, end_date))
    serializer = SummaryDetailSerializer(summaries, many=True)
    return JsonResponse(serializer.data, safe=False)


from .models import BillingData
@api_view(['GET'])
def get_billing_by_interval(request, interval):
    date_str = request.GET.get('appointmentDate')
    if not date_str:
        return JsonResponse({'error': 'Date parameter is missing'}, status=400)

    try:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'error': 'Invalid date format'}, status=400)

    if interval == 'day':
        start_date = selected_date
        end_date = selected_date  # Start and end on the same day
    elif interval == 'week':
        start_date = selected_date
        end_date = start_date + timedelta(days=6)
    elif interval == 'month':
        start_date = selected_date.replace(day=1)  # First day of the month
        # Calculate the last day of the month
        next_month = start_date.replace(day=28) + timedelta(days=4)
        end_date = next_month.replace(day=1) - timedelta(days=1)
    else:
        return JsonResponse({'error': 'Invalid interval'}, status=400)

    # Filter records from start_date to end_date
    billing = BillingData.objects.filter(appointmentDate__gte=start_date, appointmentDate__lte=end_date)
    serializer = BillingDataSerializer(billing, many=True)
    return JsonResponse({'billing_data': serializer.data}, safe=False)


from .models import ProcedureBill
from .serializers import ProcedureBillSerializer
@api_view(['GET'])
@csrf_exempt
def get_procedurebilling_by_interval(request, interval):
    date_str = request.GET.get('appointmentDate')
    if not date_str:
        return JsonResponse({'error': 'Date parameter is missing'}, status=400)

    try:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'error': 'Invalid date format'}, status=400)

    if interval == 'day':
        start_date = selected_date
        end_date = selected_date  # Start and end on the same day
    elif interval == 'week':
        start_date = selected_date
        end_date = start_date + timedelta(days=6)
    elif interval == 'month':
        start_date = selected_date.replace(day=1)  # First day of the month
        # Calculate the last day of the month
        next_month = start_date.replace(day=28) + timedelta(days=4)
        end_date = next_month.replace(day=1) - timedelta(days=1)
    else:
        return JsonResponse({'error': 'Invalid interval'}, status=400)

    procedurebilling = ProcedureBill.objects.filter(appointmentDate__gte=start_date, appointmentDate__lte=end_date)
    serializer = ProcedureBillSerializer(procedurebilling, many=True)
    return JsonResponse(serializer.data, safe=False)


@require_GET
def get_procedures_bill(request):
    date_str = request.GET.get('appointmentDate')
    if not date_str:
        return JsonResponse({'error': 'Date parameter is missing'}, status=400)
    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        # Fetch all records for the given date
        summary_details = SummaryDetail.objects.filter(appointmentDate=date)
        # Initialize a dictionary to hold detailed records by patient UID
        detailed_records = {}
        # Iterate over all matching records and aggregate their details
        for detail in summary_details:
            procedures = detail.proceduresList.split('\n')
            patient_uid = detail.patientUID
            if patient_uid not in detailed_records:
                detailed_records[patient_uid] = {
                    'patientUID': patient_uid,
                    'patientName': detail.patientName,
                    'appointmentDate': detail.appointmentDate,
                    'procedures': []
                }
            for procedure in procedures:
                if procedure.strip():  # Avoid adding empty strings
                    # Extract procedure details, assuming format "Procedure: <name> - Date: <date>"
                    parts = procedure.split(' - Date: ')
                    if len(parts) == 2:
                        procedure_name = parts[0].replace('Procedure: ', '').strip()
                        procedure_date = parts[1].strip()
                        detailed_records[patient_uid]['procedures'].append({
                            'procedure': procedure_name,
                            'procedureDate': procedure_date
                        })
        # Convert detailed_records to a list for JSON response
        response_data = list(detailed_records.values())
        # Return the detailed records
        return JsonResponse({'detailedRecords': response_data}, safe=False)
    except ValueError:
        return JsonResponse({'error': 'Invalid date format'}, status=400)
    

from .serializers import ProcedureBillSerializer
@api_view(['POST'])
def post_procedures_bill(request):
    try:
        data = json.loads(request.body)
        patientUID = data.get('patientUID')
        patientName = data.get('patientName')
        appointmentDate = data.get('appointmentDate')
        procedures = data.get('procedures')  # Ensure this is a valid JSON object
        procedureNetAmount = data.get('procedureNetAmount')
        consumerNetAmount = data.get('consumerNetAmount')
        consumer = data.get('consumer')  # Ensure this is a valid JSON object

        # Get payment types and sections for both bills
        payment_type = data.get('PaymentType')

        # Generate serial numbers for both consumer and procedure
        consumer_bill_number = generate_serial_number(payment_type, 'Consumer')
        procedure_bill_number = generate_serial_number(payment_type, 'Procedure')

        # Validate the JSON fields
        if isinstance(procedures, str):
            procedures = json.loads(procedures)
        if isinstance(consumer, str):
            consumer = json.loads(consumer)

        # Save the billing data
        billing_data = ProcedureBill(
            patientUID=patientUID,
            patientName=patientName,
            appointmentDate=appointmentDate,
            procedures=procedures,
            procedureNetAmount=procedureNetAmount,
            consumerNetAmount=consumerNetAmount,
            consumer=consumer,
            consumerBillNumber=consumer_bill_number,
            PaymentType=payment_type,
            procedureBillNumber=procedure_bill_number,
        )
        billing_data.save()

        return JsonResponse({'success': 'Billing data saved successfully!', 'consumerBillNumber': consumer_bill_number, 'procedureBillNumber': procedure_bill_number}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def medical_history(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        patientUID = data.get('patientUID')
        if not patientUID:
            return JsonResponse({'error': 'Patient UID not provided'}, status=400)
        patient_details = SummaryDetail.objects.filter(patientUID=patientUID).values()
        return JsonResponse(list(patient_details), safe=False)
        


# Connect to MongoDB
client = MongoClient('mongodb+srv://smrftcosmo:smrft%402024@cluster0.lctyiq9.mongodb.net/your_database_name?retryWrites=true&w=majority')
db = client['cosmetology']
fs = GridFS(db)
@csrf_exempt
def upload_file(request):
    if request.method == 'POST':
        patient_name = request.POST.get('patient_name')
        if 'images' in request.FILES:
            imgsrc_files = request.FILES.getlist('images')
            for index, imgsrc_file in enumerate(imgsrc_files):
                imgsrc_filename = f'{patient_name}_{index}.jpg'
                imgsrc_id = fs.put(imgsrc_file, filename=imgsrc_filename)
                # db.fs.files.insert_one({
                #     'imgsrc_id': str(imgsrc_id),
                #     'patient_name': patient_name,
                #     'file_name': imgsrc_filename,
                # })
            return HttpResponse('Images uploaded successfully')
        return HttpResponseBadRequest('No image files provided')
    return HttpResponseBadRequest('Invalid request method')
@csrf_exempt
def get_file(request):
    """
    View to retrieve a file from MongoDB GridFS.
    This view handles GET requests to retrieve a file from MongoDB GridFS based on the provided filename.
    Args:
        request (HttpRequest): The HTTP request object containing the filename to retrieve.
    Returns:
        HttpResponse: An HTTP response containing the file contents or a 404 error if the file is not found.
    """
    # Connect to MongoDB
    client = MongoClient('mongodb+srv://smrftcosmo:smrft%402024@cluster0.lctyiq9.mongodb.net/your_database_name?retryWrites=true&w=majority')
    db = client['cosmetology']
    fs = GridFS(db)
    # Get the filename from the request parameters
    filename = request.GET.get('filename')
    # Find the file in MongoDB GridFS
    file = fs.find_one({"filename": filename})
    if file is not None:
        # Return the file contents as an HTTP response
        response = HttpResponse(file.read())
        response['Content-Type'] = 'application/octet-stream'
        response['Content-Disposition'] = 'attachment; filename=%s' % file.filename
        return response
    else:
        # Return a 404 error if the file is not found
        return HttpResponse(status=404)