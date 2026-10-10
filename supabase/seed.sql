-- ====================================================================
-- TechTatva Event Management Dashboard Seed Data
-- ====================================================================

-- 1. Events
INSERT INTO events (id, name, category, description, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Sample Event: Hackathon', 'Technical', '24-hour rapid prototyping hackathon focusing on AI and Sustainability', 'ongoing'),
('22222222-2222-2222-2222-222222222222', 'Sample Event: Paper Presentation', 'Technical', 'Research paper presentation on breakthrough computer architectures and distributed systems', 'upcoming'),
('33333333-3333-3333-3333-333333333333', 'Sample Event: Cultural Dance', 'Cultural', 'Inter-collegiate classical and contemporary solo/group choreography showcase', 'completed')
ON CONFLICT (id) DO NOTHING;

-- 2. Judges
INSERT INTO judges (id, name, email, phone, organization, designation, assigned_event_id) VALUES
('44444444-4444-4444-4444-444444444441', 'Sample Judge: Dr. A Kumar', 'judge.a@sample.com', '+91 98765 43210', 'Sample University', 'Professor of Computer Science', '11111111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444442', 'Sample Judge: Prof. B Singh', 'judge.b@sample.com', '+91 98765 43211', 'Sample Institute of Technology', 'Associate Professor (AI Lab)', '11111111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444443', 'Sample Judge: Ms. C Patel', 'judge.c@sample.com', '+91 98765 43212', 'Sample Corp', 'Principal Cloud Architect', '22222222-2222-2222-2222-222222222222'),
('44444444-4444-4444-4444-444444444444', 'Sample Judge: Mr. D Rao', 'judge.d@sample.com', '+91 98765 43213', 'Sample Arts Academy', 'Lead Choreographer & Director', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- 3. Participants
INSERT INTO participants (id, name, registration_id, event_id, category, college) VALUES
('55555555-5555-5555-5555-555555555551', 'Sample Team: Alpha', 'REG001', '11111111-1111-1111-1111-111111111111', 'Technical', 'Sample College of Engineering A'),
('55555555-5555-5555-5555-555555555552', 'Sample Team: Beta', 'REG002', '11111111-1111-1111-1111-111111111111', 'Technical', 'Sample Institute of Technology B'),
('55555555-5555-5555-5555-555555555553', 'Sample Team: Gamma', 'REG003', '22222222-2222-2222-2222-222222222222', 'Technical', 'Sample College of Engineering A'),
('55555555-5555-5555-5555-555555555554', 'Sample Team: Delta', 'REG004', '22222222-2222-2222-2222-222222222222', 'Technical', 'Sample National College C'),
('55555555-5555-5555-5555-555555555555', 'Sample Team: Epsilon', 'REG005', '33333333-3333-3333-3333-333333333333', 'Cultural', 'Sample Institute of Technology B'),
('55555555-5555-5555-5555-555555555556', 'Sample Team: Zeta', 'REG006', '33333333-3333-3333-3333-333333333333', 'Cultural', 'Sample Academy of Fine Arts D')
ON CONFLICT (id) DO NOTHING;

-- 4. Criteria
INSERT INTO criteria (id, event_id, name, max_marks) VALUES
('66666666-6666-6666-6666-666666666661', '11111111-1111-1111-1111-111111111111', 'Innovation & Originality', 10),
('66666666-6666-6666-6666-666666666662', '11111111-1111-1111-1111-111111111111', 'Technical Implementation', 10),
('66666666-6666-6666-6666-666666666663', '11111111-1111-1111-1111-111111111111', 'UI/UX & Usability', 10),
('66666666-6666-6666-6666-666666666664', '11111111-1111-1111-1111-111111111111', 'Presentation & Scalability', 10),
('66666666-6666-6666-6666-666666666665', '22222222-2222-2222-2222-222222222222', 'Content Quality', 10),
('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Research Depth', 10),
('66666666-6666-6666-6666-666666666667', '22222222-2222-2222-2222-222222222222', 'Presentation Skills', 10),
('66666666-6666-6666-6666-666666666668', '33333333-3333-3333-3333-333333333333', 'Choreography & Rhythm', 10),
('66666666-6666-6666-6666-666666666669', '33333333-3333-3333-3333-333333333333', 'Expression & Emotion', 10),
('66666666-6666-6666-6666-66666666666a', '33333333-3333-3333-3333-333333333333', 'Synchronization', 10),
('66666666-6666-6666-6666-66666666666b', '33333333-3333-3333-3333-333333333333', 'Costumes & Visual Appeal', 10)
ON CONFLICT (id) DO NOTHING;

-- 5. Vendors
INSERT INTO vendors (id, name, contact_person, phone, email, items_supplied, payment_status, delivery_status, notes) VALUES
('77777777-7777-7777-7777-777777777771', 'Sample Vendor: ABC Prints & Media', 'John Sample', '+91 98111 22334', 'orders@abcprints.com', 'Certificates, Badges, Banners', 'partial', 'pending', 'Advance paid (50%). Balance on delivery.'),
('77777777-7777-7777-7777-777777777772', 'Sample Vendor: XYZ Awards & Trophies', 'Jane Sample', '+91 98222 33445', 'info@xyzawards.com', 'Trophies, Medals, Mementos', 'partial', 'partial', 'Gold & Silver trophies received. Bronze pending.')
ON CONFLICT (id) DO NOTHING;

-- 6. Mementos
INSERT INTO mementos (id, name, type, vendor_id, quantity_required, quantity_received, status, notes) VALUES
('88888888-8888-8888-8888-888888888881', 'Sample: 1st Place Winner Trophy', 'trophy', '77777777-7777-7777-7777-777777777772', 9, 3, 'partial', '3 of 9 custom crystal trophies received'),
('88888888-8888-8888-8888-888888888882', 'Sample: Participation Certificate', 'certificate', '77777777-7777-7777-7777-777777777771', 50, 50, 'received', 'All 50 printed and sorted into event folders'),
('88888888-8888-8888-8888-888888888883', 'Sample: Runner-up Medal', 'medal', '77777777-7777-7777-7777-777777777772', 6, 0, 'ordered', 'Custom engraved silver medals expected by tomorrow'),
('88888888-8888-8888-8888-888888888884', 'Sample: VIP Judge Memento', 'memento', '77777777-7777-7777-7777-777777777771', 4, 0, 'pending', 'Custom wooden plaques pending approval')
ON CONFLICT (id) DO NOTHING;
