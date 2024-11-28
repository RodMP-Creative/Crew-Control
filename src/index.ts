import inquirer from 'inquirer';
import pkg from 'pg';
const { Client } = pkg;

// Database class
class Database {
  private client: InstanceType<typeof Client>;

  // Initialize the database connection
  constructor(user: string, password: string, database: string) {
    this.client = new Client({
      user,
      host: 'localhost',
      database,
      password,
      port: 5432,
    });
    this.client.connect().catch((err: { stack: any; }) => console.error('Connection error', err.stack));
  }

  // Query methods
  public async getDepartments(): Promise<any[]> {
    const res = await this.client.query('SELECT * FROM department');
    return res.rows;
  }

  public async getRoles(): Promise<any[]> {
    const res = await this.client.query('SELECT * FROM role');
    return res.rows;
  }

  public async getEmployees(): Promise<any[]> {
    const res = await this.client.query('SELECT * FROM employee');
    return res.rows;
  }

  public async addDepartment(name: string): Promise<void> {
    await this.client.query('INSERT INTO department (name) VALUES ($1)', [name]);
  }

  public async addRole(title: string, salary: number, departmentId: number): Promise<void> {
    await this.client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, departmentId]);
  }

  public async addEmployee(firstName: string, lastName: string, roleId: number, managerId: number | null): Promise<void> {
    await this.client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [firstName, lastName, roleId, managerId]);
  }

  public async updateEmployeeRole(employeeId: number, newRoleId: number): Promise<void> {
    await this.client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [newRoleId, employeeId]);
  }

  public async updateEmployeeManager(employeeId: number, managerId: number): Promise<void> {
    await this.client.query('UPDATE employee SET manager_id = $1 WHERE id = $2', [managerId, employeeId]);
  }

  public async close(): Promise<void> {
    await this.client.end();
  }
}

// CLI class
class Cli {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Start the CLI
  public async start(): Promise<void> {
    const choices = [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Update an employee manager', // Add this option
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices,
      },
    ]);

    // Call the method based on the user's choice
    switch (action) {
      case 'View all departments':
        await this.viewAllDepartments();
        break;
      case 'View all roles':
        await this.viewAllRoles();
        break;
      case 'View all employees':
        await this.viewAllEmployees();
        break;
      case 'Add a department':
        await this.addDepartment();
        break;
      case 'Add a role':
        await this.addRole();
        break;
      case 'Add an employee':
        await this.addEmployee();
        break;
      case 'Update an employee role':
        await this.updateEmployeeRole();
        break;
      case 'Update an employee manager':
        await this.updateEmployeeManager();
        break;
    }
    // Continue the loop
    this.start();
  }

  // View all departments
  private async viewAllDepartments(): Promise<void> {
    const departments = await this.db.getDepartments();
    console.table(departments);
  }

  // View all roles
  private async viewAllRoles(): Promise<void> {
    const roles = await this.db.getRoles();
    console.table(roles);
  }

  private async viewAllEmployees(): Promise<void> {
    const employees = await this.db.getEmployees();
    console.table(employees);
  }

  // Add a department
  private async addDepartment(): Promise<void> {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter the name of the department:',
      },
    ]);
    await this.db.addDepartment(name);
    console.log(`Department ${name} added successfully.`);
  }

  // Add a role
  private async addRole(): Promise<void> {
    const { title, salary, departmentId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the title of the role:',
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the salary for the role:',
      },
      {
        type: 'input',
        name: 'departmentId',
        message: 'Enter the department ID for the role:',
      },
    ]);
    await this.db.addRole(title, salary, departmentId);
    console.log(`Role ${title} added successfully.`);
  }

// Add an employee
  private async addEmployee(): Promise<void> {
    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: 'Enter the first name of the employee:',
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'Enter the last name of the employee:',
      },
      {
        type: 'input',
        name: 'roleId',
        message: 'Enter the role ID for the employee:',
      },
      {
        type: 'input',
        name: 'managerId',
        message: 'Enter the manager ID for the employee (if any):',
      },
    ]);
    await this.db.addEmployee(firstName, lastName, roleId, managerId);
    console.log(`Employee ${firstName} ${lastName} added successfully.`);
  }

// Update an employee role
  private async updateEmployeeRole(): Promise<void> {
    const employees = await this.db.getEmployees();
    const employeeChoices = employees.map((employee: any) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));

    const { employeeId, newRoleId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select an employee to update:',
        choices: employeeChoices,
      },
      {
        type: 'input',
        name: 'newRoleId',
        message: 'Enter the new role ID for the employee:',
      },
    ]);

    await this.db.updateEmployeeRole(employeeId, newRoleId);
    console.log(`Updated successfully.`);
  }

// Update an employee manager
  private async updateEmployeeManager() {
    const employees = await this.db.getEmployees();
    const employeeChoices = employees.map((emp: any) => ({
      name: `${emp.first_name} ${emp.last_name}`,
      value: emp.id,
    }));

    const { employeeId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee whose manager you want to update:',
        choices: employeeChoices,
      },
    ]);

    const { managerId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'managerId',
        message: 'Select the new manager:',
        choices: employeeChoices,
      },
    ]);

    await this.db.updateEmployeeManager(employeeId, managerId);
    console.log('Employee manager updated successfully.');
  }
}

// Main function to start the CLI
async function main() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'user',
      message: 'Enter your PostgreSQL username:',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter your PostgreSQL password:',
      mask: '*',
    },
    {
      type: 'input',
      name: 'database',
      message: 'Enter your PostgreSQL database name:',
    },
  ]);

  const db = new Database(answers.user, answers.password, answers.database);
  const cli = new Cli(db);
  await cli.start();
}

main();

// Close the connection when the process ends
process.on('exit', async () => {
  
});