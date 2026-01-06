# createserv/mixins.py
import json
import logging
from django.apps import apps
import bcrypt
from asgiref.sync import sync_to_async

logger = logging.getLogger("myproject")


class HeaderUserMixin:
    """Extracts user info from X-User header."""

    def get_user_from_header(self, request):
        user_header = request.headers.get('X-User')
        if not user_header:
            return None
        try:
            return json.loads(user_header)
        except json.JSONDecodeError:
            logger.error("Failed to decode X-User header", exc_info=True)
            return None


class RBACMixin:
    """Role-based access control."""

    TABLE_ACCESS = {}  # override in view

    def check_role_access(self, table, user_type):
        table_config = self.TABLE_ACCESS.get(table)
        if not table_config:
            return None, f"Invalid table '{table}'"
        if user_type not in table_config['allowed_roles']:
            return None, "Access denied"
        return table_config, None


class ValidationMixin:
    """Validates input payloads."""

    DATA_SERIALIZER_MAPPING = {}  # override in view
    CreateInputSerializer = None   # override in view

    async def validate_input(self, data):
        def sync_validate(data):
            input_serializer = self.CreateInputSerializer(data=data)
            input_serializer.is_valid(raise_exception=True)
            table = input_serializer.validated_data['table']
            raw_data = input_serializer.validated_data['data']
            data_serializer_class = self.DATA_SERIALIZER_MAPPING.get(table)

            # Bulk enrollment handling
            if table == 'enrollment' and isinstance(raw_data, dict) and isinstance(raw_data.get('courseId'), list):
                course_ids = raw_data.pop('courseId')
                validated_list = []
                student_id = raw_data.get('studentId')
                for c_id in course_ids:
                    temp_data = {'courseId': c_id}
                    if student_id is not None:
                        temp_data['studentId'] = student_id
                    serializer = data_serializer_class(data=temp_data)
                    serializer.is_valid(raise_exception=True)
                    validated_list.append(serializer.validated_data)
                return table, validated_list

            # Normal or bulk list validation
            if isinstance(raw_data, list):
                serializer = data_serializer_class(data=raw_data, many=True)
            else:
                serializer = data_serializer_class(data=raw_data)
            serializer.is_valid(raise_exception=True)
            return table, serializer.validated_data

        return await sync_to_async(sync_validate)(data)


class InsertMixin:
    """Handles DB insertion with pre-processing and password hashing."""

    async def insert_records(self, table_config, records, user=None, token=None, pre_process=None):
        processed_data = records
        if pre_process:
            processed_data = await pre_process(user, token, records)

        records_to_insert = processed_data if isinstance(processed_data, list) else [processed_data]
        model_class = apps.get_model('createserv', table_config['model_name'])
        inserted = []

        def sync_insert(records):
            local_inserted = []
            for record in records:
                if not isinstance(record, dict):
                    continue
                allowed_data = {k: v for k, v in record.items() if k in table_config['fields']}
                if not allowed_data:
                    continue

                if 'password' in allowed_data:
                    raw_password = allowed_data['password'].encode('utf-8')
                    salt = bcrypt.gensalt(rounds=10)
                    allowed_data['password'] = bcrypt.hashpw(raw_password, salt).decode('utf-8')

                final_data = {}
                for key, value in allowed_data.items():
                    if key.endswith('Id'):
                        fk_model_name = key[:-2].capitalize()
                        try:
                            FKModel = apps.get_model('createserv', fk_model_name)
                            final_data[key] = FKModel.objects.get(pk=value)
                        except Exception:
                            final_data[key] = value
                    else:
                        final_data[key] = value

                model_class.objects.create(**final_data)
                local_inserted.append(allowed_data)
            return local_inserted

        return await sync_to_async(sync_insert)(records_to_insert)
