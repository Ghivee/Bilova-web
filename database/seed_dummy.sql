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
    existing_user_id UUID;
    syms TEXT[];
    email_str TEXT;
BEGIN
    FOR i IN 1..20 LOOP
        gender := CASE WHEN i % 2 = 0 THEN 'Perempuan' ELSE 'Laki-laki' END;
        email_str := LOWER(REPLACE(names[i], ' ', '.')) || '@demo.com';

        -- 1. Cek apakah email sudah ada di auth.users (akibat run sebelumnya)
        SELECT id INTO existing_user_id FROM auth.users WHERE email = email_str LIMIT 1;

        IF existing_user_id IS NOT NULL THEN
            new_user_id := existing_user_id;
        ELSE
            new_user_id := gen_random_uuid();
            -- Insert ke auth.users terlebih dahulu agar tidak terkena Foreign Key Constraint Violation
            INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
            VALUES (
                new_user_id, 'authenticated', 'authenticated', email_str, 
                crypt('password123', gen_salt('bf')), NOW(), 
                '{"provider":"email","providers":["email"]}', '{"role":"user"}', 
                NOW(), NOW(), '', '', '', ''
            );
        END IF;

        -- 2. Insert Profil (gunakan ON CONFLICT DO UPDATE karena trigger Supabase auth.users secara otomatis membuat baris profil kosong)
        INSERT INTO profiles (id, email, full_name, role, gender, phone, date_of_birth, allergy_info, is_profile_complete, created_at)
        VALUES (
            new_user_id,
            email_str,
            names[i],
            'user',
            gender,
            '0812' || floor(random() * 90000000 + 10000000)::text,
            (NOW() - ((20 + (random() * 30)::INT) || ' years')::interval)::date,
            CASE WHEN i % 5 = 0 THEN 'Penisilin' ELSE '' END,
            true,
            NOW() - ((random() * 30)::INT || ' days')::interval
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            gender = EXCLUDED.gender,
            phone = EXCLUDED.phone,
            date_of_birth = EXCLUDED.date_of_birth,
            allergy_info = EXCLUDED.allergy_info,
            is_profile_complete = EXCLUDED.is_profile_complete,
            created_at = EXCLUDED.created_at;

        -- 3. Insert Obat
        INSERT INTO medications (id, user_id, name, dosage, frequency, instruction, total_tablets, remaining_tablets, start_date, end_date, is_active, schedule_times)
        VALUES (
            gen_random_uuid(), new_user_id, 'Amoxicillin', '500mg', '3x sehari', 'Sesudah makan', 21, (random() * 21)::INT, (NOW() - interval '3 days')::date, (NOW() + interval '4 days')::date, true, ARRAY['08:00', '14:00', '20:00']::TEXT[]
        ) RETURNING id INTO med_id;

        -- 4. Insert Kepatuhan
        INSERT INTO compliance_logs (user_id, medication_id, status, taken_at)
        VALUES 
            (new_user_id, med_id, 'taken', NOW() - interval '1 day'),
            (new_user_id, med_id, CASE WHEN i % 3 = 0 THEN 'missed' ELSE 'taken' END, NOW() - interval '2 days'),
            (new_user_id, med_id, 'taken', NOW() - interval '3 days');

        IF i % 4 = 1 THEN syms := ARRAY['mual', 'sakit_kepala']::TEXT[];
        ELSIF i % 4 = 2 THEN syms := ARRAY['diare']::TEXT[];
        ELSIF i % 4 = 3 THEN syms := ARRAY['ruam_kulit']::TEXT[];
        ELSE syms := ARRAY['lelah']::TEXT[]; END IF;

        -- 5. Insert Log Gejala
        INSERT INTO symptom_logs (user_id, medication_id, symptoms, severity, notes)
        VALUES (
            new_user_id, med_id, 
            syms,
            CASE WHEN i % 4 = 3 THEN 3 ELSE 7 END,
            CASE WHEN i % 4 = 3 THEN '[WARNING] Gatal-gatal sedikit' ELSE 'Terasa lebih baik' END
        );

    END LOOP;
END $$;
