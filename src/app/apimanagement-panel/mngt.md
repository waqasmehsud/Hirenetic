# API Management Panel (MVP)

## Overview

A simple API Management page to store and manage free API keys used by the platform. This page is intended for internal/admin use only.

---

# Features

## Dashboard Cards

* Total APIs
* Active APIs
* Disabled APIs
* Expiring Soon

---

## API List

Display all configured APIs in a table.

### Columns

| Field        | Description                    |
| ------------ | ------------------------------ |
| Name         | API name (e.g. Gemini Free)    |
| Category     | LLM, Job API, Scraper          |
| Provider     | Google, Groq, OpenRouter, etc. |
| Status       | Active / Disabled              |
| Expiration   | Expiry date (if applicable)    |
| Last Updated | Last modification date         |
| Actions      | View, Edit, Delete             |

---

## Add API

Store the following information:

* API Name
* Category
* Provider
* API Key
* Base URL (Optional)
* Model (Optional)
* Expiration Date (Optional)
* Daily Quota (Optional)
* Notes (Optional)
* Status (Active / Disabled)

---

## Edit API

Allow updating:

* API Key
* Quota
* Expiration Date
* Notes
* Status

---

## Delete API

* Confirmation dialog before deleting.

---

## Search & Filter

### Search

* API Name
* Provider

### Filter

* Category
* Status

---

## Supported Categories

* 🤖 LLM APIs
* 💼 Job APIs
* 🕷️ Scraper APIs
* 🔧 Other APIs

---

## Validation

* Required fields cannot be empty.
* API key should be hidden by default.
* Show/Hide API key toggle.

---

## Future Improvements

* Usage Tracking
* Remaining Quota
* Multiple API Keys per Provider
* Automatic Expiration Alerts
* Request Logs
* Cost Tracking
* API Health Monitoring
* Role-Based Permissions
