const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

require("dotenv").config();

var PORT = process.env.PORT || 8080;

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "employees_DB"
});

connection.connect(function(err) {
  if (err) throw err;
  menu();
});

const menu = () => {
  console.log(
    `Welcome to the Employee Tracker/Employee Management System. `
  );

  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        name: "choice",
        choices: [
          "view employees",
          "view departments",
          "view roles",
          "add employee",
          "add department",
          "add roles",
          "update an employee role"
        ]
      }
    ])
    .then(function(res) {
      if (res.choice === "view employees") {
        viewEmployees();
      } else if (res.choice === "view departments") {
        viewDepartments();
      } else if (res.choice === "view roles") {
        viewRoles();
      } else if (res.choice === "add employee") {
        addEmployee();
      } else if (res.choice === "add department") {
        addDepartment();
      } else if (res.choice === "add roles") {
        addRoles();
      } else if (res.choice === "update an employee role") {
        updateEmployee();
      }
    });
};

viewEmployees = () => {
  let query = "SELECT * FROM employee";
  connection.query(query, function(err, res) {
    if (err) throw err;
    console.log(res.length + " employees found!");
    console.table("All Employees:", res);
    next();
  });
};

viewRoles = () => {
  var query = "SELECT * FROM roles";
  connection.query(query, function(err, res) {
    if (err) throw err;
    console.log(res.length + " roles found!");
    console.table("All Roles:", res);
    next();
  });
};

viewDepartments = () => {
  var query = "SELECT * FROM department";
  connection.query(query, function(err, res) {
    if (err) throw err;
    console.log(res.length + " departments found!");
    console.table("All Departments:", res);
    next();
  });
};
addEmployee = () => {
  connection.query("SELECT * FROM roles", function(err, res) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "input",
          name: "firstName",
          message: "What is the first name of the employee you want to add?"
        },
        {
          type: "input",
          name: "lastName",
          message: "What is the last name of the employee?"
        },
        {
          type: "list",
          name: "role",
          message: "what role does this employee have?",
          
          choices: function() {
            let roleArray = [];
            for (let i = 0; i < res.length; i++) {
              roleArray.push(res[i].title);
            }
            return roleArray;
          }
        },
        {
          type: "number",
          name: "manager",
          message: "What is the id number of the manager?"
        }
      ])
      .then(function(answers) {
       
        let roleID;
        for (let j = 0; j < res.length; j++) {
          if (res[j].title == answers.role) {
            roleID = res[j].id;
          }
        }
        connection.query(
          "INSERT INTO employee SET ?",
          {
            first_name: answers.firstName,
            last_name: answers.lastName,
            role_id: roleID,
            manager_id: answers.manager
          },
          function(err, res) {
            if (err) throw err;
            console.log("here are all the current employees: ");
            viewEmployees();
          }
        );
      });
  });
};
const next = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "next",
        message: "What would you like to do next?",
        choices: ["Do something more", "Finish for now"]
      }
    ])
    .then(function(answer) {
      if (answer.next == "Do something more") {
        menu();
      } else {
        console.log("Thank you for using this application. Good bye!");
        finish();
      }
    });
};
addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "newDep",
        message: "What is the name of the new department?"
      }
    ])
    .then(function(res) {
      connection.query(
        "INSERT INTO department SET ?",
        {
          dep_name: res.newDep
        },
        function(err, res) {
          if (err) throw err;
          console.log("here are all the current departments: ");
          viewDepartments();
        }
      );
    });
};
addRoles = () => {
  connection.query("SELECT * FROM department", function(err, res) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: "input",
          name: "roleName",
          message: "What is the name of the role you want to add?"
        },
        {
          type: "input",
          name: "pay",
          message: "How much does this role pay?"
        },
        {
          type: "list",
          name: "depName",
          message: "Which department would you like to add the role to?",
          
          choices: function() {
            let depArray = [];
            for (let i = 0; i < res.length; i++) {
              depArray.push(res[i].dep_name);
            }
            return depArray;
          }
        }
      ])
      .then(function(answers) {
        
        let depID;
        for (let j = 0; j < res.length; j++) {
          if (res[j].dep_name == answers.depName) {
            depID = res[j].id;
          }
        }
        connection.query(
          "INSERT INTO roles SET ?",
          {
            dep_name: answers.depName,
            title: answers.roleName,
            salary: answers.pay,
            department_id: depID
          },
          function(err, res) {
            if (err) throw err;
            console.log("here are all the current roles: ");
            viewRoles();
          }
        );
      });
  });
};
updateEmployee = () => {
  connection.query(
    "SELECT * FROM roles, employee WHERE roles.id = employee.role_id",
    function(err, res) {
      if (err) throw err;
      inquirer
        .prompt([
          {
            type: "list",
            name: "selected",
            message: "The role of which employee would you like to edit?",
            choices: function() {
              let empArray = [];
              for (let i = 0; i < res.length; i++) {
                empArray.push(res[i].first_name + " " + res[i].last_name);
              }

              let uniqueNames = empArray =>
                empArray.filter((v, i) => empArray.indexOf(v) === i);

              return uniqueNames(empArray);
            }
          },
          {
            type: "list",
            name: "newRole",
            message: "Which role would you like to assign?",
            choices: function() {
              let roleArray = [];
              for (let i = 0; i < res.length; i++) {
                roleArray.push(res[i].title);
              }
              let uniqueRoles = roleArray =>
                roleArray.filter((v, i) => roleArray.indexOf(v) === i);
              return uniqueRoles(roleArray);
            }
          }
        ])
        .then(function(answer) {
          let newRoleID;
          for (let j = 0; j < res.length; j++) {
            if (res[j].title == answer.newRole) {
              newRoleID = res[j].role_id;
            }
          }
          let newEmpArr = answer.selected.split(" ");
          let empFirst = newEmpArr[0];
          let empLast = newEmpArr[1];
          
          connection.query(
            "UPDATE employee SET  ? WHERE ? AND ?",
            [
              {
                role_id: newRoleID
              },
              {
                first_name: empFirst
              },
              {
                last_name: empLast
              }
            ],
            function(err, res) {
              if (err) throw err;

              console.log("here is the updated employee chart:");
              viewEmployees();
            }
          );
        });
    }
  );
};
async function finish() {
  connection.end();
}