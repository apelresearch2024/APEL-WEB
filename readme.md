# IIT Roorkee - APEL Lab Portal

A full-stack web application for managing the operations, research disclosures, and personnel administration of the Advanced Power Electronics Laboratory (APEL) at IIT Roorkee.

---

## 📋 Core Features

* **Ongoing Projects:** Tracks active, externally funded research projects with PI info, timelines, and grant values.
* **Completed Projects:** An archival repository displaying successfully concluded projects in a clean data table with downloadable PDF reports.
* **Scholar Directories:** Profiles active PhD/MTech researchers and lab alumni.
* **Vacancies & Recruitment:** A live portal for posting open JRF, Postdoc, and project assistant positions.
* **Lab Ecosystem Feed:** Dynamic components for broadcasting announcements and highlighting major academic achievements.
* **Production Security:** Integrated `helmet` headers, CORS protection, and dual-tier rate limiting (strict 5-try limit on admin logins to prevent brute-force attacks).
* **Performance Tracking:** Automated Gzip response compression and reusable shimmer skeleton loaders for zero visual layout shifts during data fetching.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS, Lucide Icons.
* **Backend:** Node.js (Express), ES Modules, Gzip Compression, Helmet Security.
* **Databases:** MongoDB (via Mongoose ODM) & Supabase Storage.

---