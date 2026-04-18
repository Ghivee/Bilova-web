-- ============================================
-- BILOVA DUMMY DATA SEEDING (20 USERS)
-- ============================================

ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS folder_name TEXT DEFAULT 'Kuis Umum';

DO $$
DECLARE
    new_user_id UUID;
    i INT;
    names TEXT[] := ARRAY['Budi Santoso', 'Siti Aminah', 'Andi Hermawan', 'Dewi Lestari', 'Joko Widodo', 'Ayu Wandira', 'Rudi Haryanto', 'Rina Melati', 'Iwan Fals', 'Maya Sari', 'Dedi Mizwar', 'Rini Yulianti', 'Agus Salim', 'Nina Karlina', 'Bramantyo', 'Tika Panggabean', 'Hendra Gunawan', 'Sari Nila', 'Yudi Pratama', 'Dian Sastro'];
    gender TEXT;
    med_id UUID;
    syms TEXT[];
BEGIN
    FOR i IN 1..20 LOOP
        new_user_id := gen_random_uuid();
        gender := CASE WHEN i % 2 = 0 THEN 'Perempuan' ELSE 'Laki-laki' END;

        INSERT INTO profiles (id, email, full_name, role, gender, phone, date_of_birth, allergy_info, is_profile_complete, created_at)
        VALUES (
            new_user_id,
            LOWER(REPLACE(names[i], ' ', '.')) || '@demo.com',
            names[i],
            'user',
            gender,
            '0812' || floor(random() * 90000000 + 10000000)::text,
            (NOW() - ((20 + (random() * 30)::INT) || ' years')::interval)::date,
            CASE WHEN i % 5 = 0 THEN 'Penisilin' ELSE '' END,
            true,
            NOW() - ((random() * 30)::INT || ' days')::interval
        );

        INSERT INTO medications (id, user_id, name, dosage, frequency, instruction, total_tablets, remaining_tablets, start_date, end_date, is_active, schedule_times)
        VALUES (
            gen_random_uuid(), new_user_id, 'Amoxicillin', '500mg', '3x sehari', 'Sesudah makan', 21, (random() * 21)::INT, (NOW() - interval '3 days')::date, (NOW() + interval '4 days')::date, true, ARRAY['08:00', '14:00', '20:00']::TEXT[]
        ) RETURNING id INTO med_id;

        INSERT INTO compliance_logs (user_id, medication_id, status, taken_at)
        VALUES 
            (new_user_id, med_id, 'taken', NOW() - interval '1 day'),
            (new_user_id, med_id, CASE WHEN i % 3 = 0 THEN 'missed' ELSE 'taken' END, NOW() - interval '2 days'),
            (new_user_id, med_id, 'taken', NOW() - interval '3 days');

        IF i % 4 = 1 THEN syms := ARRAY['mual', 'sakit_kepala']::TEXT[];
        ELSIF i % 4 = 2 THEN syms := ARRAY['diare']::TEXT[];
        ELSIF i % 4 = 3 THEN syms := ARRAY['ruam_kulit']::TEXT[];
        ELSE syms := ARRAY['lelah']::TEXT[]; END IF;

        INSERT INTO symptom_logs (user_id, medication_id, symptoms, severity, notes)
        VALUES (
            new_user_id, med_id, 
            syms,
            CASE WHEN i % 4 = 3 THEN 3 ELSE 7 END,
            CASE WHEN i % 4 = 3 THEN '[WARNING] Gatal-gatal sedikit' ELSE 'Terasa lebih baik' END
        );

    END LOOP;
END $$;
