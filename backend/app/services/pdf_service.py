"""
pdf_service.py — Professional PDF Financial Report Generator.

Generates beautifully formatted, multi-page PDF documents for:
  1. Monthly Financial Report
  2. Yearly Financial Report
  3. Expense Report
  4. Income Report
  5. Budget Report
  6. Savings Goal Report
  7. Cash Flow Report

Features:
  - Custom NumberedCanvas with dynamic "Page X of Y" footers
  - Repeated table headers on new pages (repeatRows=1)
  - KPI summary metric blocks
  - Clean typographic hierarchy and alternating row shading
  - Safe handling of empty datasets
  - Output as in-memory bytes (io.BytesIO)
"""
from __future__ import annotations

import io
from calendar import month_name, monthrange
from datetime import date, datetime
from typing import Any, List, Optional, Tuple

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services.report_service import ReportService


# ---------------------------------------------------------------------------
# Color Palette & Styling Constants
# ---------------------------------------------------------------------------

PRIMARY_COLOR = colors.HexColor("#1E293B")    # Slate 800 (Headers / Dark)
SECONDARY_COLOR = colors.HexColor("#2563EB")  # Blue 600 (Accents)
TEXT_DARK = colors.HexColor("#0F172A")        # Slate 900
TEXT_MUTED = colors.HexColor("#64748B")       # Slate 500
BORDER_COLOR = colors.HexColor("#CBD5E1")     # Slate 300
BG_ROW_EVEN = colors.HexColor("#F8FAFC")      # Slate 50
BG_ROW_ODD = colors.HexColor("#FFFFFF")       # White
BG_KPI = colors.HexColor("#F1F5F9")           # Slate 100
SUCCESS_COLOR = colors.HexColor("#16A34A")    # Green 600
DANGER_COLOR = colors.HexColor("#DC2626")     # Red 600


# ---------------------------------------------------------------------------
# Numbered Canvas for "Page X of Y" Footers
# ---------------------------------------------------------------------------

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to calculate total page count and add running footers."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(TEXT_MUTED)

        # Footer divider line
        self.setStrokeColor(BORDER_COLOR)
        self.setLineWidth(0.5)
        self.line(36, 32, letter[0] - 36, 32)

        # Footer text
        self.drawString(36, 20, "Smart Expense Tracker  •  Confidential Financial Report")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 36, 20, page_str)
        self.restoreState()


# ---------------------------------------------------------------------------
# PDF Report Service
# ---------------------------------------------------------------------------

class PdfService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self._report_service = ReportService(db)
        self._styles = getSampleStyleSheet()
        self._init_custom_styles()

    def _init_custom_styles(self):
        self.style_app_title = ParagraphStyle(
            "AppTitle",
            parent=self._styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=18,
            textColor=PRIMARY_COLOR,
        )
        self.style_report_title = ParagraphStyle(
            "ReportTitle",
            parent=self._styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=SECONDARY_COLOR,
            alignment=2,
        )
        self.style_meta = ParagraphStyle(
            "MetaInfo",
            parent=self._styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=TEXT_MUTED,
        )
        self.style_meta_right = ParagraphStyle(
            "MetaInfoRight",
            parent=self.style_meta,
            alignment=2,
        )
        self.style_section_heading = ParagraphStyle(
            "SectionHeading",
            parent=self._styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=14,
            textColor=PRIMARY_COLOR,
            spaceAfter=4,
        )
        self.style_th = ParagraphStyle(
            "TableHeader",
            parent=self._styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=colors.white,
            alignment=0,
        )
        self.style_th_right = ParagraphStyle(
            "TableHeaderRight",
            parent=self.style_th,
            alignment=2,
        )
        self.style_th_center = ParagraphStyle(
            "TableHeaderCenter",
            parent=self.style_th,
            alignment=1,
        )
        self.style_td = ParagraphStyle(
            "TableCell",
            parent=self._styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=10,
            textColor=TEXT_DARK,
        )
        self.style_td_right = ParagraphStyle(
            "TableCellRight",
            parent=self.style_td,
            alignment=2,
        )
        self.style_td_center = ParagraphStyle(
            "TableCellCenter",
            parent=self.style_td,
            alignment=1,
        )
        self.style_td_bold = ParagraphStyle(
            "TableCellBold",
            parent=self.style_td,
            fontName="Helvetica-Bold",
        )
        self.style_td_bold_right = ParagraphStyle(
            "TableCellBoldRight",
            parent=self.style_td_right,
            fontName="Helvetica-Bold",
        )
        self.style_kpi_label = ParagraphStyle(
            "KpiLabel",
            parent=self._styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=9,
            textColor=TEXT_MUTED,
            alignment=1,
        )
        self.style_kpi_val = ParagraphStyle(
            "KpiVal",
            parent=self._styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=PRIMARY_COLOR,
            alignment=1,
        )

    def _build_header(
        self,
        report_title: str,
        user_name: str,
        period: str,
        currency: str,
    ) -> List[Any]:
        """Returns standard report header flowables."""
        gen_time = datetime.now().strftime("%d %b %Y, %I:%M %p")
        meta_left = f"<b>User:</b> {user_name}<br/><b>Period:</b> {period}"
        meta_right = f"<b>Generated:</b> {gen_time}<br/><b>Currency:</b> {currency}"

        header_table = Table(
            [
                [Paragraph("SMART EXPENSE TRACKER", self.style_app_title), Paragraph(report_title, self.style_report_title)],
                [Paragraph(meta_left, self.style_meta), Paragraph(meta_right, self.style_meta_right)],
            ],
            colWidths=[3.5 * inch, 3.5 * inch],
        )
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))

        return [
            header_table,
            Spacer(1, 4),
            HRFlowable(width="100%", thickness=1.5, color=PRIMARY_COLOR, spaceAfter=8),
        ]

    def _build_kpi_grid(self, kpis: List[Tuple[str, str, Optional[colors.Color]]]) -> Table:
        """Renders 4-column or 3-column KPI metric summary boxes."""
        cells = []
        for label, val, color_override in kpis:
            val_style = ParagraphStyle(
                f"KpiVal_{label}_{id(color_override)}",
                parent=self.style_kpi_val,
                textColor=color_override or PRIMARY_COLOR,
            )
            card_content = [
                Paragraph(label.upper(), self.style_kpi_label),
                Spacer(1, 2),
                Paragraph(val, val_style),
            ]
            cells.append(card_content)

        count = len(cells)
        chunk_size = 4 if count >= 4 else (3 if count == 3 else 2)
        rows = [cells[i:i + chunk_size] for i in range(0, count, chunk_size)]
        while len(rows[-1]) < chunk_size:
            rows[-1].append([])

        col_w = (7.0 * inch) / chunk_size
        table = Table(rows, colWidths=[col_w] * chunk_size)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BG_KPI),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        return table

    def _render_pdf(self, story: List[Any]) -> bytes:
        """Renders story flowables into a PDF byte string using NumberedCanvas."""
        buf = io.BytesIO()
        doc = SimpleDocTemplate(
            buf,
            pagesize=letter,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=42,
        )
        doc.build(story, canvasmaker=NumberedCanvas)
        return buf.getvalue()

    def _empty_notice(self, message: str = "No transactions found for the selected period.") -> Table:
        t = Table([[Paragraph(f"<i>{message}</i>", self.style_td_center)]], colWidths=[7.0 * inch])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BG_ROW_EVEN),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("PADDING", (0, 0), (-1, -1), 8),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))
        return t

    # ═══════════════════════════════════════════════════════════════════════
    # 1. MONTHLY FINANCIAL REPORT PDF
    # ═══════════════════════════════════════════════════════════════════════

    async def monthly_report_pdf(
        self,
        user: User,
        year: Optional[int] = None,
        month: Optional[int] = None,
        currency: str = "INR",
    ) -> Tuple[bytes, str]:
        cur_year = year or date.today().year
        cur_month = month or date.today().month
        period_str = f"{month_name[cur_month]} {cur_year}"
        report = await self._report_service.monthly_report(user.id, cur_year, cur_month, currency)

        user_name = user.email
        story = []
        story.extend(self._build_header("Monthly Financial Statement", user_name, period_str, currency))

        # KPIs
        net_color = SUCCESS_COLOR if report.net_balance >= 0 else DANGER_COLOR
        kpis = [
            ("Total Income", f"{currency} {report.total_income:,.2f}", None),
            ("Total Expenses", f"{currency} {report.total_expenses:,.2f}", None),
            ("Net Balance", f"{currency} {report.net_balance:,.2f}", net_color),
            ("Savings Rate", f"{report.savings_rate:.1f}%", SUCCESS_COLOR),
        ]
        story.append(self._build_kpi_grid(kpis))
        story.append(Spacer(1, 10))

        # Expense Category Breakdown
        story.append(Paragraph("Expense Breakdown by Category", self.style_section_heading))
        if report.expense_by_category:
            rows = [[
                Paragraph("Category", self.style_th),
                Paragraph(f"Amount ({currency})", self.style_th_right),
                Paragraph("Transactions", self.style_th_center),
                Paragraph("% Share", self.style_th_right),
            ]]
            for cat in report.expense_by_category:
                rows.append([
                    Paragraph(cat.category_name, self.style_td),
                    Paragraph(f"{cat.total_amount:,.2f}", self.style_td_right),
                    Paragraph(str(cat.transaction_count), self.style_td_center),
                    Paragraph(f"{cat.percentage:.1f}%", self.style_td_right),
                ])
            rows.append([
                Paragraph("<b>TOTAL</b>", self.style_td_bold),
                Paragraph(f"<b>{report.total_expenses:,.2f}</b>", self.style_td_bold_right),
                Paragraph(f"<b>{report.expense_transaction_count}</b>", self.style_td_center),
                Paragraph("<b>100.0%</b>", self.style_td_bold_right),
            ])

            t = Table(rows, colWidths=[2.8 * inch, 1.6 * inch, 1.2 * inch, 1.4 * inch], repeatRows=1)
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                ("ROWBACKGROUNDS", (0, 1), (-1, -2), [BG_ROW_ODD, BG_ROW_EVEN]),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("LINEABOVE", (0, -1), (-1, -1), 1.0, PRIMARY_COLOR),
                ("PADDING", (0, 0), (-1, -1), 3.5),
            ]))
            story.append(t)
        else:
            story.append(self._empty_notice("No expenses recorded for this month."))

        story.append(Spacer(1, 10))

        # Budget Utilization
        story.append(Paragraph("Budget Utilization", self.style_section_heading))
        if report.budget_utilization:
            b_rows = [[
                Paragraph("Category", self.style_th),
                Paragraph(f"Budget ({currency})", self.style_th_right),
                Paragraph(f"Spent ({currency})", self.style_th_right),
                Paragraph(f"Remaining ({currency})", self.style_th_right),
                Paragraph("Utilized %", self.style_th_center),
                Paragraph("Status", self.style_th_center),
            ]]
            for b in report.budget_utilization:
                status_txt = f"<font color='{DANGER_COLOR.hexval()}'><b>OVER</b></font>" if b.is_over_budget else f"<font color='{SUCCESS_COLOR.hexval()}'><b>OK</b></font>"
                b_rows.append([
                    Paragraph(b.category_name, self.style_td),
                    Paragraph(f"{b.budget_amount:,.2f}", self.style_td_right),
                    Paragraph(f"{b.utilized_amount:,.2f}", self.style_td_right),
                    Paragraph(f"{b.remaining_amount:,.2f}", self.style_td_right),
                    Paragraph(f"{b.utilization_percentage:.1f}%", self.style_td_center),
                    Paragraph(status_txt, self.style_td_center),
                ])
            bt = Table(b_rows, colWidths=[1.8 * inch, 1.1 * inch, 1.1 * inch, 1.1 * inch, 1.0 * inch, 0.9 * inch], repeatRows=1)
            bt.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [BG_ROW_ODD, BG_ROW_EVEN]),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("PADDING", (0, 0), (-1, -1), 3.5),
            ]))
            story.append(bt)
        else:
            story.append(self._empty_notice("No active budgets configured."))

        pdf_bytes = self._render_pdf(story)
        filename = f"monthly_report_{cur_year}_{cur_month:02d}.pdf"
        return pdf_bytes, filename

    # ═══════════════════════════════════════════════════════════════════════
    # 2. YEARLY FINANCIAL REPORT PDF
    # ═══════════════════════════════════════════════════════════════════════

    async def yearly_report_pdf(
        self,
        user: User,
        year: Optional[int] = None,
        currency: str = "INR",
    ) -> Tuple[bytes, str]:
        cur_year = year or date.today().year
        period_str = f"Calendar Year {cur_year}"
        report = await self._report_service.yearly_report(user.id, cur_year, currency)

        user_name = user.email
        story = []
        story.extend(self._build_header("Yearly Financial Statement", user_name, period_str, currency))

        net_color = SUCCESS_COLOR if report.net_balance >= 0 else DANGER_COLOR
        kpis = [
            ("Yearly Income", f"{currency} {report.total_income:,.2f}", None),
            ("Yearly Expenses", f"{currency} {report.total_expenses:,.2f}", None),
            ("Net Balance", f"{currency} {report.net_balance:,.2f}", net_color),
            ("Total Savings", f"{currency} {report.total_savings_contributions:,.2f}", SUCCESS_COLOR),
        ]
        story.append(self._build_kpi_grid(kpis))
        story.append(Spacer(1, 10))

        story.append(Paragraph("12-Month Financial Summary", self.style_section_heading))
        rows = [[
            Paragraph("Month", self.style_th),
            Paragraph(f"Income ({currency})", self.style_th_right),
            Paragraph(f"Expenses ({currency})", self.style_th_right),
            Paragraph(f"Net Balance ({currency})", self.style_th_right),
            Paragraph(f"Savings ({currency})", self.style_th_right),
        ]]

        for m in report.monthly_breakdown:
            net_style = self.style_td_bold_right if m.net != 0 else self.style_td_right
            color_tag = f"<font color='{SUCCESS_COLOR.hexval()}'>" if m.net > 0 else (f"<font color='{DANGER_COLOR.hexval()}'>" if m.net < 0 else "")
            color_end = "</font>" if color_tag else ""
            rows.append([
                Paragraph(month_name[m.month], self.style_td),
                Paragraph(f"{m.income:,.2f}", self.style_td_right),
                Paragraph(f"{m.expenses:,.2f}", self.style_td_right),
                Paragraph(f"{color_tag}{m.net:,.2f}{color_end}", net_style),
                Paragraph(f"{m.savings_contributions:,.2f}", self.style_td_right),
            ])

        # Totals Row
        rows.append([
            Paragraph("<b>YEARLY TOTAL</b>", self.style_td_bold),
            Paragraph(f"<b>{report.total_income:,.2f}</b>", self.style_td_bold_right),
            Paragraph(f"<b>{report.total_expenses:,.2f}</b>", self.style_td_bold_right),
            Paragraph(f"<b>{report.net_balance:,.2f}</b>", self.style_td_bold_right),
            Paragraph(f"<b>{report.total_savings_contributions:,.2f}</b>", self.style_td_bold_right),
        ])
        # Average Row
        rows.append([
            Paragraph("<b>MONTHLY AVERAGE</b>", self.style_td_bold),
            Paragraph(f"<b>{report.average_monthly_income:,.2f}</b>", self.style_td_bold_right),
            Paragraph(f"<b>{report.average_monthly_expenses:,.2f}</b>", self.style_td_bold_right),
            Paragraph(f"<b>{report.net_balance / 12:,.2f}</b>", self.style_td_bold_right),
            Paragraph(f"<b>{report.total_savings_contributions / 12:,.2f}</b>", self.style_td_bold_right),
        ])

        t = Table(rows, colWidths=[1.8 * inch, 1.3 * inch, 1.3 * inch, 1.3 * inch, 1.3 * inch], repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
            ("ROWBACKGROUNDS", (0, 1), (-1, -3), [BG_ROW_ODD, BG_ROW_EVEN]),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("LINEABOVE", (0, -2), (-1, -2), 1.0, PRIMARY_COLOR),
            ("PADDING", (0, 0), (-1, -1), 3.5),
        ]))
        story.append(t)

        pdf_bytes = self._render_pdf(story)
        filename = f"yearly_report_{cur_year}.pdf"
        return pdf_bytes, filename

    # ═══════════════════════════════════════════════════════════════════════
    # 3. EXPENSE REPORT PDF
    # ═══════════════════════════════════════════════════════════════════════

    async def expense_report_pdf(
        self,
        user: User,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        currency: str = "INR",
    ) -> Tuple[bytes, str]:
        cur_year, cur_month = date.today().year, date.today().month
        last_day = monthrange(cur_year, cur_month)[1]
        start = start_date or date(cur_year, cur_month, 1)
        end = end_date or date(cur_year, cur_month, last_day)
        period_str = f"{start} to {end}"

        report = await self._report_service.expense_report(user.id, start, end, currency)
        user_name = user.email

        story = []
        story.extend(self._build_header("Expense Analysis Report", user_name, period_str, currency))

        kpis = [
            ("Total Expenses", f"{currency} {report.total_expenses:,.2f}", None),
            ("Transactions", str(report.transaction_count), None),
            ("Average Expense", f"{currency} {report.average_expense:,.2f}", None),
            ("Largest Expense", f"{currency} {report.largest_expense:,.2f}", None),
        ]
        story.append(self._build_kpi_grid(kpis))
        story.append(Spacer(1, 10))

        # Category Table
        story.append(Paragraph("Category Distribution", self.style_section_heading))
        if report.by_category:
            c_rows = [[
                Paragraph("Category", self.style_th),
                Paragraph(f"Amount ({currency})", self.style_th_right),
                Paragraph("Transactions", self.style_th_center),
                Paragraph("Share %", self.style_th_right),
            ]]
            for cat in report.by_category:
                c_rows.append([
                    Paragraph(cat.category_name, self.style_td),
                    Paragraph(f"{cat.total_amount:,.2f}", self.style_td_right),
                    Paragraph(str(cat.transaction_count), self.style_td_center),
                    Paragraph(f"{cat.percentage:.1f}%", self.style_td_right),
                ])
            ct = Table(c_rows, colWidths=[3.0 * inch, 1.5 * inch, 1.2 * inch, 1.3 * inch], repeatRows=1)
            ct.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [BG_ROW_ODD, BG_ROW_EVEN]),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("PADDING", (0, 0), (-1, -1), 3.5),
            ]))
            story.append(ct)
        else:
            story.append(self._empty_notice("No expense categories found."))

        story.append(Spacer(1, 10))

        # Payment Methods Table
        if report.by_payment_method:
            story.append(Paragraph("Payment Method Breakdown", self.style_section_heading))
            p_rows = [[
                Paragraph("Payment Method", self.style_th),
                Paragraph(f"Amount ({currency})", self.style_th_right),
                Paragraph("Transactions", self.style_th_center),
                Paragraph("Share %", self.style_th_right),
            ]]
            for pm in report.by_payment_method:
                p_rows.append([
                    Paragraph(pm.payment_method or "Unspecified", self.style_td),
                    Paragraph(f"{pm.total_amount:,.2f}", self.style_td_right),
                    Paragraph(str(pm.transaction_count), self.style_td_center),
                    Paragraph(f"{pm.percentage:.1f}%", self.style_td_right),
                ])
            pt = Table(p_rows, colWidths=[3.0 * inch, 1.5 * inch, 1.2 * inch, 1.3 * inch], repeatRows=1)
            pt.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [BG_ROW_ODD, BG_ROW_EVEN]),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("PADDING", (0, 0), (-1, -1), 3.5),
            ]))
            story.append(pt)
            story.append(Spacer(1, 10))

        # Top Expenses
        story.append(Paragraph("Top Largest Expenses", self.style_section_heading))
        if report.top_expenses:
            l_rows = [[
                Paragraph("Date", self.style_th_center),
                Paragraph("Description", self.style_th),
                Paragraph("Category", self.style_th),
                Paragraph(f"Amount ({currency})", self.style_th_right),
            ]]
            for exp in report.top_expenses:
                l_rows.append([
                    Paragraph(str(exp.date), self.style_td_center),
                    Paragraph(exp.description or "N/A", self.style_td),
                    Paragraph(exp.category_name or "Uncategorized", self.style_td),
                    Paragraph(f"{exp.amount:,.2f}", self.style_td_bold_right),
                ])
            lt = Table(l_rows, colWidths=[1.2 * inch, 2.4 * inch, 2.0 * inch, 1.4 * inch], repeatRows=1)
            lt.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [BG_ROW_ODD, BG_ROW_EVEN]),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("PADDING", (0, 0), (-1, -1), 3.5),
            ]))
            story.append(lt)
        else:
            story.append(self._empty_notice("No transactions recorded."))

        pdf_bytes = self._render_pdf(story)
        filename = f"expense_report_{start}_to_{end}.pdf"
        return pdf_bytes, filename

    # ═══════════════════════════════════════════════════════════════════════
    # 4. INCOME REPORT PDF
    # ═══════════════════════════════════════════════════════════════════════

    async def income_report_pdf(
        self,
        user: User,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        currency: str = "INR",
    ) -> Tuple[bytes, str]:
        cur_year, cur_month = date.today().year, date.today().month
        last_day = monthrange(cur_year, cur_month)[1]
        start = start_date or date(cur_year, cur_month, 1)
        end = end_date or date(cur_year, cur_month, last_day)
        period_str = f"{start} to {end}"

        report = await self._report_service.income_report(user.id, start, end, currency)
        user_name = user.email

        story = []
        story.extend(self._build_header("Income Analysis Report", user_name, period_str, currency))

        kpis = [
            ("Total Income", f"{currency} {report.total_income:,.2f}", SUCCESS_COLOR),
            ("Transactions", str(report.transaction_count), None),
            ("Average Income", f"{currency} {report.average_income:,.2f}", None),
            ("Largest Income", f"{currency} {report.largest_income:,.2f}", SUCCESS_COLOR),
        ]
        story.append(self._build_kpi_grid(kpis))
        story.append(Spacer(1, 10))

        story.append(Paragraph("Income by Source", self.style_section_heading))
        if report.by_source:
            s_rows = [[
                Paragraph("Source", self.style_th),
                Paragraph(f"Amount ({currency})", self.style_th_right),
                Paragraph("Transactions", self.style_th_center),
                Paragraph("Share %", self.style_th_right),
            ]]
            for s in report.by_source:
                s_rows.append([
                    Paragraph(s.source, self.style_td),
                    Paragraph(f"{s.total_amount:,.2f}", self.style_td_right),
                    Paragraph(str(s.transaction_count), self.style_td_center),
                    Paragraph(f"{s.percentage:.1f}%", self.style_td_right),
                ])
            st = Table(s_rows, colWidths=[3.0 * inch, 1.5 * inch, 1.2 * inch, 1.3 * inch], repeatRows=1)
            st.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [BG_ROW_ODD, BG_ROW_EVEN]),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("PADDING", (0, 0), (-1, -1), 3.5),
            ]))
            story.append(st)
        else:
            story.append(self._empty_notice("No income sources found."))

        story.append(Spacer(1, 10))

        story.append(Paragraph("Top Largest Income Entries", self.style_section_heading))
        if report.top_income_entries:
            i_rows = [[
                Paragraph("Date", self.style_th_center),
                Paragraph("Description / Source", self.style_th),
                Paragraph("Category", self.style_th),
                Paragraph(f"Amount ({currency})", self.style_th_right),
            ]]
            for inc in report.top_income_entries:
                i_rows.append([
                    Paragraph(str(inc.date), self.style_td_center),
                    Paragraph(inc.description or "N/A", self.style_td),
                    Paragraph(inc.category_name or "Uncategorized", self.style_td),
                    Paragraph(f"{inc.amount:,.2f}", self.style_td_bold_right),
                ])
            it = Table(i_rows, colWidths=[1.2 * inch, 2.4 * inch, 2.0 * inch, 1.4 * inch], repeatRows=1)
            it.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [BG_ROW_ODD, BG_ROW_EVEN]),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("PADDING", (0, 0), (-1, -1), 3.5),
            ]))
            story.append(it)
        else:
            story.append(self._empty_notice("No income entries recorded."))

        pdf_bytes = self._render_pdf(story)
        filename = f"income_report_{start}_to_{end}.pdf"
        return pdf_bytes, filename

    # ═══════════════════════════════════════════════════════════════════════
    # 5. BUDGET REPORT PDF
    # ═══════════════════════════════════════════════════════════════════════

    async def budget_report_pdf(
        self,
        user: User,
        year: Optional[int] = None,
        month: Optional[int] = None,
        currency: str = "INR",
    ) -> Tuple[bytes, str]:
        cur_year = year or date.today().year
        cur_month = month or date.today().month
        period_str = f"{month_name[cur_month]} {cur_year}"

        report = await self._report_service.budget_report(user.id, cur_year, cur_month, currency)
        user_name = user.email

        story = []
        story.extend(self._build_header("Budget Utilization Report", user_name, period_str, currency))

        kpis = [
            ("Total Budgeted", f"{currency} {report.total_budgeted:,.2f}", None),
            ("Total Utilized", f"{currency} {report.total_utilized:,.2f}", None),
            ("Remaining", f"{currency} {report.total_remaining:,.2f}", SUCCESS_COLOR if report.total_remaining >= 0 else DANGER_COLOR),
            ("Utilization %", f"{report.overall_utilization_percentage:.1f}%", None),
        ]
        story.append(self._build_kpi_grid(kpis))
        story.append(Spacer(1, 10))

        story.append(Paragraph("Category Budget Performance", self.style_section_heading))
        if report.budgets:
            rows = [[
                Paragraph("Category", self.style_th),
                Paragraph(f"Budget ({currency})", self.style_th_right),
                Paragraph(f"Spent ({currency})", self.style_th_right),
                Paragraph(f"Remaining ({currency})", self.style_th_right),
                Paragraph("Utilized %", self.style_th_center),
                Paragraph("Status", self.style_th_center),
            ]]
            for b in report.budgets:
                status_txt = f"<font color='{DANGER_COLOR.hexval()}'><b>OVER BUDGET</b></font>" if b.is_over_budget else f"<font color='{SUCCESS_COLOR.hexval()}'><b>OK</b></font>"
                rows.append([
                    Paragraph(b.category_name, self.style_td),
                    Paragraph(f"{b.budget_amount:,.2f}", self.style_td_right),
                    Paragraph(f"{b.utilized_amount:,.2f}", self.style_td_right),
                    Paragraph(f"{b.remaining_amount:,.2f}", self.style_td_right),
                    Paragraph(f"{b.utilization_percentage:.1f}%", self.style_td_center),
                    Paragraph(status_txt, self.style_td_center),
                ])
            # Totals
            rows.append([
                Paragraph("<b>TOTAL</b>", self.style_td_bold),
                Paragraph(f"<b>{report.total_budgeted:,.2f}</b>", self.style_td_bold_right),
                Paragraph(f"<b>{report.total_utilized:,.2f}</b>", self.style_td_bold_right),
                Paragraph(f"<b>{report.total_remaining:,.2f}</b>", self.style_td_bold_right),
                Paragraph(f"<b>{report.overall_utilization_percentage:.1f}%</b>", self.style_td_center),
                Paragraph(f"<b>{report.over_budget_count} Over</b>", self.style_td_center),
            ])

            t = Table(rows, colWidths=[1.8 * inch, 1.1 * inch, 1.1 * inch, 1.1 * inch, 0.9 * inch, 1.0 * inch], repeatRows=1)
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                ("ROWBACKGROUNDS", (0, 1), (-1, -2), [BG_ROW_ODD, BG_ROW_EVEN]),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("LINEABOVE", (0, -1), (-1, -1), 1.0, PRIMARY_COLOR),
                ("PADDING", (0, 0), (-1, -1), 3.5),
            ]))
            story.append(t)
        else:
            story.append(self._empty_notice("No category budgets configured for this month."))

        pdf_bytes = self._render_pdf(story)
        filename = f"budget_report_{cur_year}_{cur_month:02d}.pdf"
        return pdf_bytes, filename

    # ═══════════════════════════════════════════════════════════════════════
    # 6. SAVINGS GOAL REPORT PDF
    # ═══════════════════════════════════════════════════════════════════════

    async def savings_goal_report_pdf(
        self,
        user: User,
        currency: str = "INR",
    ) -> Tuple[bytes, str]:
        period_str = f"As of {date.today().strftime('%d %b %Y')}"
        report = await self._report_service.savings_goal_report(user.id, currency)
        user_name = user.email

        story = []
        story.extend(self._build_header("Savings Goals & Progress Report", user_name, period_str, currency))

        kpis = [
            ("Total Target", f"{currency} {report.total_target_amount:,.2f}", None),
            ("Total Saved", f"{currency} {report.total_saved_amount:,.2f}", SUCCESS_COLOR),
            ("Remaining", f"{currency} {report.total_remaining_amount:,.2f}", None),
            ("Overall Progress", f"{report.overall_progress_percentage:.1f}%", SUCCESS_COLOR),
        ]
        story.append(self._build_kpi_grid(kpis))
        story.append(Spacer(1, 10))

        story.append(Paragraph("Active & Completed Goals", self.style_section_heading))
        if report.goals:
            rows = [[
                Paragraph("Goal Name", self.style_th),
                Paragraph(f"Target ({currency})", self.style_th_right),
                Paragraph(f"Saved ({currency})", self.style_th_right),
                Paragraph(f"Remaining ({currency})", self.style_th_right),
                Paragraph("Progress %", self.style_th_center),
                Paragraph("Deadline", self.style_th_center),
            ]]
            for g in report.goals:
                rows.append([
                    Paragraph(g.name, self.style_td),
                    Paragraph(f"{g.target_amount:,.2f}", self.style_td_right),
                    Paragraph(f"{g.current_amount:,.2f}", self.style_td_right),
                    Paragraph(f"{g.remaining_amount:,.2f}", self.style_td_right),
                    Paragraph(f"{g.progress_percentage:.1f}%", self.style_td_center),
                    Paragraph(str(g.deadline or "N/A"), self.style_td_center),
                ])
            # Totals
            rows.append([
                Paragraph("<b>TOTAL</b>", self.style_td_bold),
                Paragraph(f"<b>{report.total_target_amount:,.2f}</b>", self.style_td_bold_right),
                Paragraph(f"<b>{report.total_saved_amount:,.2f}</b>", self.style_td_bold_right),
                Paragraph(f"<b>{report.total_remaining_amount:,.2f}</b>", self.style_td_bold_right),
                Paragraph(f"<b>{report.overall_progress_percentage:.1f}%</b>", self.style_td_center),
                Paragraph(f"<b>{report.active_goals} Active</b>", self.style_td_center),
            ])

            t = Table(rows, colWidths=[1.8 * inch, 1.1 * inch, 1.1 * inch, 1.1 * inch, 0.9 * inch, 1.0 * inch], repeatRows=1)
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                ("ROWBACKGROUNDS", (0, 1), (-1, -2), [BG_ROW_ODD, BG_ROW_EVEN]),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("LINEABOVE", (0, -1), (-1, -1), 1.0, PRIMARY_COLOR),
                ("PADDING", (0, 0), (-1, -1), 3.5),
            ]))
            story.append(t)
        else:
            story.append(self._empty_notice("No savings goals created yet."))

        pdf_bytes = self._render_pdf(story)
        filename = f"savings_goals_report_{date.today()}.pdf"
        return pdf_bytes, filename

    # ═══════════════════════════════════════════════════════════════════════
    # 7. CASH FLOW REPORT PDF
    # ═══════════════════════════════════════════════════════════════════════

    async def cash_flow_report_pdf(
        self,
        user: User,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        currency: str = "INR",
    ) -> Tuple[bytes, str]:
        cur_year, cur_month = date.today().year, date.today().month
        last_day = monthrange(cur_year, cur_month)[1]
        start = start_date or date(cur_year, cur_month, 1)
        end = end_date or date(cur_year, cur_month, last_day)
        period_str = f"{start} to {end}"

        report = await self._report_service.cash_flow_report(user.id, start, end, currency)
        user_name = user.email

        story = []
        story.extend(self._build_header("Cash Flow Statement", user_name, period_str, currency))

        net_color = SUCCESS_COLOR if report.net_cash_flow >= 0 else DANGER_COLOR
        kpis = [
            ("Total Inflow", f"{currency} {report.total_income:,.2f}", SUCCESS_COLOR),
            ("Total Outflow", f"{currency} {report.total_expenses:,.2f}", None),
            ("Savings Transfers", f"{currency} {report.total_savings_contributions:,.2f}", None),
            ("Net Cash Flow", f"{currency} {report.net_cash_flow:,.2f}", net_color),
        ]
        story.append(self._build_kpi_grid(kpis))
        story.append(Spacer(1, 10))

        story.append(Paragraph("Month-by-Month Cash Flow Statement", self.style_section_heading))
        if report.monthly_breakdown:
            rows = [[
                Paragraph("Period", self.style_th),
                Paragraph(f"Inflow ({currency})", self.style_th_right),
                Paragraph(f"Outflow ({currency})", self.style_th_right),
                Paragraph(f"Savings ({currency})", self.style_th_right),
                Paragraph(f"Net Cash Flow ({currency})", self.style_th_right),
            ]]
            for m in report.monthly_breakdown:
                period_label = f"{month_name[m.month]} {m.year}"
                color_tag = f"<font color='{SUCCESS_COLOR.hexval()}'>" if m.net_cash_flow > 0 else (f"<font color='{DANGER_COLOR.hexval()}'>" if m.net_cash_flow < 0 else "")
                color_end = "</font>" if color_tag else ""
                rows.append([
                    Paragraph(period_label, self.style_td),
                    Paragraph(f"{m.income:,.2f}", self.style_td_right),
                    Paragraph(f"{m.expenses:,.2f}", self.style_td_right),
                    Paragraph(f"{m.savings_contributions:,.2f}", self.style_td_right),
                    Paragraph(f"{color_tag}{m.net_cash_flow:,.2f}{color_end}", self.style_td_bold_right),
                ])
            # Totals
            rows.append([
                Paragraph("<b>TOTAL</b>", self.style_td_bold),
                Paragraph(f"<b>{report.total_income:,.2f}</b>", self.style_td_bold_right),
                Paragraph(f"<b>{report.total_expenses:,.2f}</b>", self.style_td_bold_right),
                Paragraph(f"<b>{report.total_savings_contributions:,.2f}</b>", self.style_td_bold_right),
                Paragraph(f"<b>{report.net_cash_flow:,.2f}</b>", self.style_td_bold_right),
            ])

            t = Table(rows, colWidths=[1.8 * inch, 1.3 * inch, 1.3 * inch, 1.3 * inch, 1.3 * inch], repeatRows=1)
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                ("ROWBACKGROUNDS", (0, 1), (-1, -2), [BG_ROW_ODD, BG_ROW_EVEN]),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("LINEABOVE", (0, -1), (-1, -1), 1.0, PRIMARY_COLOR),
                ("PADDING", (0, 0), (-1, -1), 3.5),
            ]))
            story.append(t)
        else:
            story.append(self._empty_notice("No cash flow activity for this date range."))

        pdf_bytes = self._render_pdf(story)
        filename = f"cash_flow_report_{start}_to_{end}.pdf"
        return pdf_bytes, filename
