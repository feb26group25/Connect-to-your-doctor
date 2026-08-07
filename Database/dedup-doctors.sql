USE p25_ctyd;

DELETE FROM availability WHERE doctorid IN (1, 2, 3, 4, 5);

UPDATE feedback SET doctorid = 6 WHERE doctorid IN (1, 2, 3, 4, 5);

UPDATE appointments SET doctorid = 6 WHERE doctorid IN (1, 2, 3, 4, 5);

DELETE FROM doctors WHERE doctorid IN (1, 2, 3, 4, 5);

SELECT doctorid, userid, doctor_name, specialization, email FROM doctors;
