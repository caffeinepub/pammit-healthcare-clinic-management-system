# Specification

## Summary
**Goal:** Enhance the Finance page with per-category expense reports, a total finance summary, PDF/Excel/print export options, and editable expense entries.

**Planned changes:**
- Add a dedicated report section for each expense category (Rent, Salaries, Supplies, Equipment, Utilities, Miscellaneous, etc.) showing filtered entries, subtotals, and a date range filter
- Add a Total Finance Summary section aggregating all categories with per-category totals and a grand total, also filterable by date range
- Add "Export PDF" button to each category report and the Total Finance Summary that downloads a formatted PDF with title, date range, line items, and totals
- Add "Export Excel" button to each category report and the Total Finance Summary that downloads a .xlsx file with date, description, category, and amount columns plus a totals row
- Add a "Print" button to each category report and the Total Finance Summary with a print-optimized layout that hides navigation and action buttons
- Make every expense entry row editable via an edit button that opens a pre-filled form (amount, date, description, category), with changes persisted to the backend

**User-visible outcome:** Users can view, filter, export (PDF/Excel), and print separate expense reports per category as well as an overall finance summary, and can edit any expense entry directly from the report at any time.
