from django.db import models


class Admin(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, null=True, blank=True)
    cnic = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=8, default='active')  # active/inactive
    gender = models.CharField(max_length=6, null=True, blank=True)  # male/female
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admin'
        managed = False


class Teacher(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, null=True, blank=True)
    cnic = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=8, default='active')
    gender = models.CharField(max_length=6, null=True, blank=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'teacher'
        managed = False


class Student(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, null=True, blank=True)
    cnic = models.CharField(max_length=20, null=True, blank=True)
    status = models.CharField(max_length=8, default='active')
    gender = models.CharField(max_length=6, null=True, blank=True)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'student'
        managed = False


class Course(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    teacherId = models.ForeignKey(
        Teacher, null=True, blank=True,
        on_delete=models.SET_NULL,
        db_column='teacherId',
        related_name='courses'
    )
    credit_hours = models.IntegerField(default=3)
    isDeleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'course'
        managed = False


class Enrollment(models.Model):
    id = models.AutoField(primary_key=True)
    studentId = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        db_column='studentId',
        related_name='enrollments'
    )
    courseId = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        db_column='courseId',
        related_name='enrollments'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'enrollment'
        managed = False
        unique_together = ('studentId', 'courseId')


class Token(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    user_type = models.CharField(max_length=10)  # student/teacher/admin
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True)

    class Meta:
        db_table = 'tokens'
        managed = False
