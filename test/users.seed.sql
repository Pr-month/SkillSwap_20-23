INSERT INTO public."user" (id, name, email, password, age, city, gender, avatar, role, refreshtoken) 
VALUES 
-- Административная учетная запись
(
    '123e4567-e89b-12d3-a456-426614174001',
    'Admin User',
    'admin@example.com',
    '$2b$10$examplehash',
    30,
    'Москва',
    'male',
    'https://example.com/avatar-admin.jpg',
    'ADMIN',
    'refresh-token-admin-123'
),

-- Обычные пользователи
(
    '123e4567-e89b-12d3-a456-426614174002',
    'Иван Петров',
    'ivan@example.com',
    '$2b$10$examplehash2',
    25,
    'Санкт-Петербург',
    'male',
    'https://example.com/avatar-ivan.jpg',
    'USER',
    'refresh-token-ivan-123'
),
(
    '123e4567-e89b-12d3-a456-426614174003',
    'Анна Сидорова',
    'anna@example.com',
    '$2b$10$examplehash3',
    22,
    'Екатеринбург',
    'female',
    'https://example.com/avatar-anna.jpg',
    'USER',
    'refresh-token-anna-123'
),
(
    '123e4567-e89b-12d3-a456-426614174004',
    'Мария Иванова',
    'maria@example.com',
    '$2b$10$examplehash4',
    28,
    'Казань',
    'female',
    'https://example.com/avatar-maria.jpg',
    'USER',
    'refresh-token-maria-123'
);