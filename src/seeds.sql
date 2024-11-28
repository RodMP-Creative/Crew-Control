INSERT INTO department (name) VALUES ('HR'), ('Engineering'), ('Sales');

INSERT INTO role (title, salary, department_id) VALUES
('Manager', 60000, 1),
('Engineer', 80000, 2),
('Salesperson', 50000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, NULL),
('Jim', 'Brown', 3, NULL);

UPDATE employee SET manager_id = 1 WHERE id IN (2, 3);