# Employee Management CLI

A Node.js command‑line application for managing employees with SQLite persistence and currency conversion support.  
Users can add employees, list them, and search by ID or name. Input validation ensures correctness for email, dates, salary ranges, and currency codes.

---

##  Features
- **SQLite database** for persistent employee storage
- **Currency conversion** using external API data
- **Validated input** for:
  - Strings (names)
  - Email addresses
  - Integers (salary, dates)
  - Boolean values (`yes`/`no`)
  - Currency codes
- **Commands**:
  - `list` → display all employees
  - `add` → add a new employee interactively
  - `search-by-id` → find employee by ID
  - `search-by-name` → find employee by first/last name

---

##  Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/CodeMorera/employee-data-api.git
   
