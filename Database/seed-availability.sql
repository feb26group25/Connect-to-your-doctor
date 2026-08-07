USE p25_ctyd;

INSERT INTO availability (doctorid, start_time, end_time, slot_duration_minutes, created_at)
VALUES 
(6, '09:00:00', '17:00:00', 30, NOW()),
(7, '09:00:00', '17:00:00', 30, NOW()),
(8, '09:00:00', '17:00:00', 30, NOW()),
(9, '09:00:00', '17:00:00', 30, NOW()),
(10, '09:00:00', '17:00:00', 30, NOW()),
(11, '09:00:00', '17:00:00', 30, NOW());

SELECT * FROM availability;
