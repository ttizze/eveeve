# eveeve Project

## Overview
eveeve (Everyone Translate Everything) is a fully open-source project that aims to provide high-quality translations and readable layouts for books published on the internet. The project's goal is to break down language barriers, allowing everyone to access literature and knowledge from around the world in various languages.

## Project Name Origin
"eveeve" is an abbreviation of "Everyone Translate Everything." This name embodies the project's philosophy of global collaboration in translating and sharing knowledge.

## Features
- Multi-language support: Providing translations between various languages
- Multiple format support: PDF, HTML, EPUB, plain text
- High-quality translations: Combination of machine translation and human review
- Reader-friendly layout: Easy-to-read side-by-side translations
- Open-source: Continuous improvement and expansion by the community
- Shared database: Allowing contributions from users worldwide

## Target Books
This project covers all books publicly available on the internet. However, we take utmost care to comply with copyright laws and not use copyrighted material without proper permission.

## System Architecture
- Backend: Python FastAPI (providing RESTful API)
- Frontend: React (web interface)
- Database: PostgreSQL (using Supabase)
- Translation Engine: OpenNMT (for machine translation)

## How to Use
1. Clone this repository:
   ```
   git clone https://github.com/yourusername/eveeve.git
   ```
2. Install the necessary dependencies:
   ```
   cd eveeve
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   ```
   export SUPABASE_URL=your_supabase_url
   export SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the backend service:
   ```
   uvicorn main:app --reload
   ```
5. In a separate terminal, start the frontend:
   ```
   cd frontend
   npm install
   npm start
   ```
6. Access eveeve by opening `http://localhost:3000` in your browser.

## Database Access
This project uses Supabase for a shared database. For security reasons, please set database connection information as environment variables.

## How to Add Data
1. Use the "Add New Data" form within the application.
2. Enter the necessary information (original text, translation, metadata, etc.).
3. After submission, the data will be added to the database following community review.

## API Documentation
API documentation can be found at the `/docs` endpoint (e.g., `http://localhost:8000/docs`).

## How to Contribute
We welcome all forms of contribution, including translation, programming, design, and documentation. Before contributing, please read the CONTRIBUTING.md file.

## Security Notes
- This project uses a shared database. Do not enter personal or confidential information.
- All data operations are logged and monitored by the community.
- If you have any security concerns, please report them to the project administrators immediately.

## License
This project is released under the MIT License. For details, please see the LICENSE file.

## Contact
If you have any questions or suggestions, please create an Issue or send a message to the project mailing list.

Let's work together to provide access to literature and knowledge for people around the world!
