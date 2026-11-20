import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#666666"))
        self.drawString(36, 18, "Data Analysis Laboratory Notebook - Complete Lab Experiments")
        self.drawRightString(letter[0] - 36, 18, f"Page {self._pageNumber} of {page_count}")
        self.setStrokeColor(colors.HexColor("#dddddd"))
        self.setLineWidth(0.5)
        self.line(36, 27, letter[0] - 36, 27)
        self.restoreState()

def build_pdf(filename="Data_Analysis_Experiments_Condensed.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=30,
        rightMargin=30,
        topMargin=26,
        bottomMargin=34
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'ExpTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0d47a1'),
        spaceAfter=2,
        spaceBefore=4,
        keepWithNext=True
    )
    
    sec_style = ParagraphStyle(
        'SecHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#1565c0'),
        spaceBefore=4,
        spaceAfter=2,
        keepWithNext=True
    )

    desc_style = ParagraphStyle(
        'ExpDesc',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#37474f'),
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=6.0,
        leading=7.2,
        textColor=colors.HexColor('#1b5e20')
    )

    out_style = ParagraphStyle(
        'OutputStyle',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=5.8,
        leading=7.0,
        textColor=colors.HexColor('#212121')
    )

    text_style = ParagraphStyle(
        'NormalText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.0,
        leading=8.5,
        textColor=colors.HexColor('#212121')
    )

    tbl_text = ParagraphStyle(
        'TblText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.0,
        leading=7.2
    )
    
    tbl_bold = ParagraphStyle(
        'TblBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.0,
        leading=7.2
    )

    def code_box(code_str, width=552):
        p = Paragraph(code_str.replace('\n', '<br/>').replace(' ', '&nbsp;'), code_style)
        t = Table([[p]], colWidths=[width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8f9fa')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cfd8dc')),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        return t

    def output_box(out_str, width=552):
        p = Paragraph(out_str.replace('\n', '<br/>').replace(' ', '&nbsp;'), out_style)
        t = Table([[p]], colWidths=[width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f8e9')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#c8e6c9')),
            ('LEFTPADDING', (0,0), (-1,-1), 4),
            ('RIGHTPADDING', (0,0), (-1,-1), 4),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        return t

    def side_by_side(flow_left, flow_right, left_w=273, right_w=273, pad=6):
        t = Table([[flow_left, flow_right]], colWidths=[left_w, right_w])
        t.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (0,0), pad/2),
            ('LEFTPADDING', (1,0), (1,0), pad/2),
        ]))
        return t

    story = []

    # =========================================================================
    # EXPERIMENT 1
    # =========================================================================
    story.append(Paragraph("Experiment 1: Understanding Data Before Analysis", title_style))
    story.append(Paragraph("A university wants to understand the factors associated with student academic performance before developing student-support programs.", desc_style))

    exp1_c1 = """# Import required libraries
import kagglehub, pandas as pd, os, glob
path = kagglehub.dataset_download("lainguyn123/student-performance-factors")
csv_files = glob.glob(os.path.join(path, "*.csv"))
df = pd.read_csv(csv_files[0])
print("Dataset loaded successfully!")
display(df.head()); display(df.tail())"""

    exp1_o1 = """Dataset files: ['...\\\\StudentPerformanceFactors.csv']
Dataset loaded successfully!
First 5 Records:
   Hours_Studied  Attendance  Parental_Involvement  Access_to_Resources  Sleep_Hours
0             23          84                   Low                 High            7
1             19          64                   Low               Medium            8
2             24          98                Medium               Medium            7
3             29          89                   Low               Medium            8
4             19          92                Medium               Medium            6
Last 5 Records:
6602          25          69                  High               Medium            7
6603          23          76                  High               Medium            8
6604          20          90                Medium                  Low            6
6605          10          86                  High                 High            6
6606          15          67                Medium                  Low            9"""

    story.append(Paragraph("1) Load Dataset + First/Last Records", sec_style))
    story.append(side_by_side(code_box(exp1_c1, 273), output_box(exp1_o1, 273)))
    story.append(Spacer(1, 3))

    story.append(Paragraph("2) Dataset Summary + Column Names & Data Types", sec_style))
    exp1_c2 = """# Dataset Summary & Structure
rows, columns = df.shape
print("Rows:", rows, "| Columns:", columns)
for i, col in enumerate(df.columns, 1): print(f"{i}. {col}")
display(df.dtypes)
display(df.isnull().sum())"""

    exp1_o2 = """===== DATASET SUMMARY =====
Rows: 6607 | Columns: 20
===== COLUMNS & MISSING VALUES =====
1. Hours_Studied (int64, null: 0)     11. Family_Income (str, null: 0)
2. Attendance (int64, null: 0)        12. Teacher_Quality (str, null: 78)
3. Parental_Involvement (str, null: 0) 13. School_Type (str, null: 0)
4. Access_to_Resources (str, null: 0) 14. Peer_Influence (str, null: 0)
5. Extracurricular_Activities (str: 0)15. Physical_Activity (int64: 0)
6. Sleep_Hours (int64, null: 0)       16. Learning_Disabilities (str: 0)
7. Previous_Scores (int64, null: 0)   17. Parental_Education (str: 90)
8. Motivation_Level (str, null: 0)    18. Distance_from_Home (str: 67)
9. Internet_Access (str, null: 0)     19. Gender (str, null: 0)
10. Tutoring_Sessions (int64, null: 0)20. Exam_Score (int64, null: 0)"""

    story.append(side_by_side(code_box(exp1_c2, 273), output_box(exp1_o2, 273)))
    story.append(Spacer(1, 3))

    story.append(Paragraph("3) Variable Classification Table (Automated Schema Detection)", sec_style))
    
    # Compact table of classification
    cls_data = [
        ["#", "Variable", "Type", "Discrete/Continuous", "Scale", "Uniq"],
        ["0", "Hours_Studied", "Numerical", "Discrete", "Ratio", "41"],
        ["1", "Attendance", "Numerical", "Discrete", "Ratio", "41"],
        ["2", "Parental_Involvement", "Categorical", "Categorical", "Ordinal", "3"],
        ["3", "Access_to_Resources", "Categorical", "Categorical", "Ordinal", "3"],
        ["4", "Extracurricular_Activities", "Categorical", "Categorical", "Ordinal", "2"],
        ["5", "Sleep_Hours", "Numerical", "Discrete", "Ratio", "7"],
        ["6", "Previous_Scores", "Numerical", "Continuous", "Ratio", "51"],
        ["7", "Motivation_Level", "Categorical", "Categorical", "Ordinal", "3"],
        ["8", "Internet_Access", "Categorical", "Categorical", "Ordinal", "2"],
        ["9", "Tutoring_Sessions", "Numerical", "Discrete", "Ratio", "9"],
        ["10", "Family_Income", "Categorical", "Categorical", "Ordinal", "3"],
        ["11", "Teacher_Quality", "Categorical", "Categorical", "Ordinal", "3"],
        ["12", "School_Type", "Categorical", "Categorical", "Nominal", "2"],
        ["13", "Peer_Influence", "Categorical", "Categorical", "Nominal", "3"],
        ["14", "Physical_Activity", "Numerical", "Discrete", "Ratio", "7"],
        ["15", "Learning_Disabilities", "Categorical", "Categorical", "Ordinal", "2"],
        ["16", "Parental_Education_Level", "Categorical", "Categorical", "Nominal", "3"],
        ["17", "Distance_from_Home", "Categorical", "Categorical", "Nominal", "3"],
        ["18", "Gender", "Categorical", "Categorical", "Nominal", "2"],
        ["19", "Exam_Score", "Numerical", "Discrete", "Ratio", "45"]
    ]
    t_cls = Table([[Paragraph(c, tbl_bold if r==0 else tbl_text) for c in row] for r, row in enumerate(cls_data)],
                  colWidths=[16, 120, 75, 95, 65, 30])
    t_cls.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e3f2fd')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
        ('ALIGN', (-1,0), (-1,-1), 'CENTER'),
    ]))

    exp1_c3 = """# Automated Classification Logic:
classification = []
for col in df.columns:
  if pd.api.types.is_numeric_dtype(df[col]):
    vtype, nature = "Numerical", ("Discrete" if df[col].nunique()<50 else "Continuous")
    scale = "Ratio"
  else:
    vtype, nature = "Categorical", "Categorical"
    scale = "Ordinal" if any(w in df[col].dropna().astype(str).tolist() 
            for w in ["Low","Medium","High","Poor","Good","No","Yes"]) else "Nominal"
  classification.append([col, vtype, nature, scale, df[col].nunique()])
display(pd.DataFrame(classification, columns=["Variable","Type","Discrete/Continuous","Scale","Uniq"]))"""

    story.append(side_by_side(code_box(exp1_c3, 145), t_cls, left_w=145, right_w=403))
    story.append(Spacer(1, 3))

    story.append(Paragraph("4 & 5) Data Dictionary, Outcomes & Recommended Visualizations", sec_style))
    exp1_c4 = """# Data Dictionary & Outcome Discovery
data_dict = pd.DataFrame({"Variable": df.columns, "DataType": df.dtypes.astype(str), "Meaning": "Attribute definition"})
outcomes = [c for c in df.columns if any(w in c.lower() for w in ["exam","score","performance"])]
print("Outcome-Related Variables:", outcomes) # ['Previous_Scores', 'Exam_Score']"""

    # Recommendation table
    rec_data = [
        ["Variable", "Recommended Chart", "Analytical Justification"],
        ["Hours_Studied", "Histogram", "Shows the distribution of study hours across student cohorts."],
        ["Attendance", "Histogram", "Identifies skewness and density in student attendance percentage."],
        ["Sleep_Hours", "Histogram", "Examines natural distribution and sleep deprivation patterns."],
        ["Previous_Scores", "Histogram", "Visualizes historical academic spread and normality."],
        ["Exam_Score", "Histogram / Box Plot", "Evaluates final score distribution, central tendency, and outliers."],
        ["Parental_Involvement", "Bar Chart", "Compares relative proportions across ordinal involvement tiers."],
        ["Access_to_Resources", "Bar Chart", "Assesses disparity in resource availability categories."],
        ["Extracurricular_Act.", "Bar Chart", "Compares participation frequencies directly."]
    ]
    t_rec = Table([[Paragraph(c, tbl_bold if r==0 else tbl_text) for c in row] for r, row in enumerate(rec_data)],
                  colWidths=[105, 100, 343])
    t_rec.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e8f5e9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
    ]))
    story.append(code_box(exp1_c4, 552))
    story.append(Spacer(1, 2))
    story.append(t_rec)

    story.append(PageBreak())

    # =========================================================================
    # EXPERIMENT 2
    # =========================================================================
    story.append(Paragraph("Experiment 2: Can a Visualization Mislead the Decision-Maker?", title_style))
    story.append(Paragraph("A business manager receives visualizations showing company performance. Some visualizations create misleading impressions due to poor scales, inappropriate colors, or incorrect chart selection.", desc_style))

    exp2_prep_c = """# Data Preparation & Business Question: Which category generates highest Sales & Profit?
import kagglehub, pandas as pd, matplotlib.pyplot as plt
path = kagglehub.dataset_download("vivek468/superstore-dataset-final")
df = pd.read_csv(csv_files[0], encoding="latin1")
print("Missing:", df.isnull().sum().sum()) # 0
category_data = df.groupby("Category")[["Sales", "Profit"]].sum().reset_index()
display(category_data)"""

    exp2_prep_o = """Sales and Profit by Category:
         Category          Sales         Profit
0       Furniture  741,999.7953   18,451.2728
1 Office Supplies  719,047.0320  122,490.8008
2      Technology  836,154.0330  145,454.9481"""

    story.append(side_by_side(code_box(exp2_prep_c, 273), output_box(exp2_prep_o, 273)))
    story.append(Spacer(1, 3))

    story.append(Paragraph("Original Misleading vs Improved Truthful Visualization", sec_style))
    exp2_left = [
        Paragraph("<b>Misleading Chart Code (Truncated Y-Axis + Arbitrary Colors):</b>", text_style),
        code_box("""plt.figure(figsize=(9, 5))
plt.bar(category_data["Category"], category_data["Sales"], color=["red", "blue", "green"])
# Truncated Y-Axis exaggerates differences:
plt.ylim(category_data["Sales"].min()*0.90, category_data["Sales"].max()*1.02)
plt.title("Company Sales Performance")
plt.show()""", 270),
        Spacer(1, 2),
        Image("output_pdf/charts/exp2_misleading.png", width=265, height=140)
    ]

    exp2_right = [
        Paragraph("<b>Improved Chart Code (Zero Baseline + Uniform Palette + Data Labels):</b>", text_style),
        code_box("""plt.figure(figsize=(9, 5))
bars = plt.bar(category_data["Category"], category_data["Sales"])
plt.ylim(0, category_data["Sales"].max()*1.15)
for bar in bars:
  plt.text(bar.get_x()+bar.get_width()/2, bar.get_height(), f"${bar.get_height():,.0f}", ha="center", va="bottom")
plt.grid(axis="y", alpha=0.3); plt.show()""", 270),
        Spacer(1, 2),
        Image("output_pdf/charts/exp2_improved.png", width=265, height=140)
    ]
    story.append(side_by_side(exp2_left, exp2_right, 273, 273))
    story.append(Spacer(1, 3))

    story.append(Paragraph("Visualization Critique, Feature Comparison & Strategic Business Conclusion", sec_style))
    
    t_comp_data = [
        ["Feature", "Original (Misleading)", "Improved (Truthful)", "Analytical & Decision Impact"],
        ["Scale", "Truncated Y-axis (starts ~650k)", "Starts at zero (0 baseline)", "Prevents false impression of massive 10x difference."],
        ["Colors", "Multiple unnecessary (Red/Blue/Green)", "Simple consistent corporate blue", "Eliminates false cognitive grouping or perceived alerts."],
        ["Labels", "Limited / None on bars", "Exact dollar amounts labeled", "Gives executive clarity on precise sales magnitude."],
        ["Chart Type", "Uncalibrated basic bar", "Appropriate standardized bar", "Conforms to ethical data presentation standards."],
        ["Decision Making", "Can mislead the manager", "Supports accurate decisions", "Shows Technology leads moderately, not overwhelmingly."]
    ]
    t_comp = Table([[Paragraph(c, tbl_bold if r==0 else tbl_text) for c in row] for r, row in enumerate(t_comp_data)],
                   colWidths=[65, 135, 145, 203])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#ede7f6')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 2))

    exp2_conc = """<b>BUSINESS ANALYSIS & CONCLUSION:</b><br/>
• <b>Highest Sales & Profit:</b> Technology ($836,154 sales, $145,455 profit). Furniture has high sales ($741,999) but severely lagging profit ($18,451).<br/>
• <b>Ethical Takeaway:</b> The original visualization distorted reality by truncating the baseline, making Technology appear 10× larger than Office Supplies. The improved chart provides true visual proportionality and exact metrics, allowing managers to allocate capital based on genuine performance."""
    story.append(output_box(exp2_conc, 552))

    story.append(PageBreak())

    # =========================================================================
    # EXPERIMENT 3
    # =========================================================================
    story.append(Paragraph("Experiment 3: Why Is the Average Not Enough?", title_style))
    story.append(Paragraph("A company wants to understand income distribution. Management wants to report the average income, but extreme values may affect the result.", desc_style))

    exp3_c1 = """import kagglehub, pandas as pd, matplotlib.pyplot as plt, seaborn as sns
path = kagglehub.dataset_download("uciml/adult-census-income")
df = pd.read_csv(csv_files[0]) # Shape: (32561, 15)
data = df["age"].dropna()
stats = {"Mean": data.mean(), "Median": data.median(), "Mode": data.mode().iloc[0],
         "Min": data.min(), "Max": data.max(), "Range": data.max()-data.min(),
         "Variance": data.var(), "Std Dev": data.std(), "Q1": data.quantile(0.25),
         "Q2": data.quantile(0.50), "Q3": data.quantile(0.75), "IQR": data.quantile(0.75)-data.quantile(0.25),
         "Skewness": data.skew()}
display(pd.DataFrame(stats.items(), columns=["Measure", "Value"]))"""

    exp3_stats_data = [
        ["Statistical Measure", "Value", "Interpretation"],
        ["Mean", "38.58 yrs", "Pulled upwards by older individuals."],
        ["Median", "37.00 yrs", "50th percentile (robust central measure)."],
        ["Mode", "36.00 yrs", "Most frequently occurring single age."],
        ["Min / Max / Range", "17 / 90 / 73 yrs", "Wide working-age distribution."],
        ["Variance / Std Dev", "186.06 / 13.64", "Substantial spread around the mean."],
        ["Q1 (25%) / Q2 / Q3 (75%)", "28.0 / 37.0 / 48.0", "50% of people are between 28 and 48 yrs."],
        ["IQR", "20.0 yrs", "Interquartile range (Q3 - Q1)."],
        ["Skewness", "+0.5587", "Moderately right-skewed distribution."]
    ]
    t_stats = Table([[Paragraph(c, tbl_bold if r==0 else tbl_text) for c in row] for r, row in enumerate(exp3_stats_data)],
                    colWidths=[90, 65, 115])
    t_stats.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e0f2f1')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))

    story.append(Paragraph("1 & 2) Dataset Ingestion & Complete Statistical Summary", sec_style))
    story.append(side_by_side(code_box(exp3_c1, 275), t_stats, 275, 271))
    story.append(Spacer(1, 3))

    story.append(Paragraph("3 & 4) Distribution Modeling & Outlier Detection", sec_style))
    exp3_vis_left = [
        Paragraph("<b>Histogram + KDE Code & Distribution Curve:</b>", text_style),
        code_box("""plt.figure(figsize=(10, 5))
sns.histplot(data, bins=30, kde=True)
plt.title("Distribution of Age"); plt.xlabel("Age"); plt.show()""", 270),
        Spacer(1, 2),
        Image("output_pdf/charts/exp3_hist.png", width=265, height=125)
    ]
    exp3_vis_right = [
        Paragraph("<b>Boxplot + IQR Outlier Detection Code & Chart:</b>", text_style),
        code_box("""Q1, Q3 = data.quantile(0.25), data.quantile(0.75); IQR = Q3 - Q1
lower_limit, upper_limit = Q1 - 1.5*IQR, Q3 + 1.5*IQR # [-2.0, 78.0]
outliers = data[(data < lower_limit) | (data > upper_limit)]
print("Outliers count:", len(outliers)) # 143 outliers (> 78 yrs)
sns.boxplot(x=data); plt.title("Boxplot of Age"); plt.show()""", 270),
        Spacer(1, 2),
        Image("output_pdf/charts/exp3_box.png", width=265, height=110)
    ]
    story.append(side_by_side(exp3_vis_left, exp3_vis_right, 273, 273))
    story.append(Spacer(1, 3))

    story.append(Paragraph("5) Mean vs Median Comparison & Final Executive Interpretation", sec_style))
    exp3_interp = """<b>OUTLIER & DISTRIBUTION METRICS:</b><br/>
• <b>IQR Outlier Thresholds:</b> Lower = 28 - 1.5(20) = -2.0 | Upper = 48 + 1.5(20) = 78.0 | Outliers Detected: <b>143 rows</b> (individuals aged > 78).<br/>
• <b>Mean vs Median Gap:</b> Mean (38.58) exceeds Median (37.00) by 1.58 years; Skewness = +0.56 (positively right-skewed tail).<br/>
• <b>Core Conclusion:</b> The mean is disproportionately influenced by high-age outliers and skewness. In salary/demographic analysis, reporting only the arithmetic average overstates central tendency. The median, paired with histogram and boxplot visualizations, provides a robust, untainted depiction of reality."""
    story.append(output_box(exp3_interp, 552))

    story.append(PageBreak())

    # =========================================================================
    # EXPERIMENT 4
    # =========================================================================
    story.append(Paragraph("Experiment 4: Does One Variable Influence Another?", title_style))
    story.append(Paragraph("A bike-sharing company wants to understand how weather conditions influence bike rental demand.", desc_style))

    exp4_c1 = """import kagglehub, pandas as pd, glob, os, matplotlib.pyplot as plt, seaborn as sns
path = kagglehub.dataset_download("lakshmi25npathi/bike-sharing-dataset")
df = pd.read_csv(glob.glob(os.path.join(path, "*day*.csv"))[0])
data = df[["temp", "hum", "windspeed", "cnt", "season"]]
corr = data[["temp", "hum", "windspeed", "cnt"]].corr()
display(corr.round(2))"""

    corr_table_data = [
        ["Variable", "temp", "hum", "windspeed", "cnt (Rentals)"],
        ["temp", "1.00", "0.13", "-0.16", "+0.63 (Strong Pos)"],
        ["hum", "0.13", "1.00", "-0.25", "-0.10 (Weak Neg)"],
        ["windspeed", "-0.16", "-0.25", "1.00", "-0.23 (Moderate Neg)"],
        ["cnt", "+0.63", "-0.10", "-0.23", "1.00"]
    ]
    t_corr = Table([[Paragraph(c, tbl_bold if (r==0 or i==0) else tbl_text) for i, c in enumerate(row)] for r, row in enumerate(corr_table_data)],
                   colWidths=[65, 45, 45, 55, 65])
    t_corr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e8eaf6')),
        ('BACKGROUND', (4,1), (4,3), colors.HexColor('#fff9c4')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
    ]))

    story.append(Paragraph("1 & 2) Dataset Load & Correlation Matrix", sec_style))
    story.append(side_by_side(code_box(exp4_c1, 273), t_corr, 273, 275))
    story.append(Spacer(1, 3))

    story.append(Paragraph("3 & 4) Scatter Plots & Correlation Heatmap", sec_style))
    story.append(code_box("""fig, ax = plt.subplots(1, 3, figsize=(15, 4))
for i, col in enumerate(["temp", "hum", "windspeed"]):
  sns.scatterplot(data=data, x=col, y="cnt", ax=ax[i]); ax[i].set_title(f"{col} vs Rentals")
plt.tight_layout(); plt.show()
sns.heatmap(corr, annot=True, cmap="coolwarm", fmt=".2f"); plt.title("Correlation Heatmap"); plt.show()""", 552))
    story.append(Spacer(1, 2))

    story.append(side_by_side(
        Image("output_pdf/charts/exp4_scatter.png", width=340, height=130),
        Image("output_pdf/charts/exp4_heatmap.png", width=190, height=130),
        left_w=345, right_w=200
    ))
    story.append(Spacer(1, 3))

    story.append(Paragraph("5) Seasonal Variations & Key Findings", sec_style))
    exp4_season_data = [
        ["Season", "temp vs cnt", "hum vs cnt", "windspeed vs cnt", "Business Takeaway"],
        ["1 (Spring)", "+0.67", "-0.04", "-0.09", "Warming temperatures sharply accelerate rental adoption."],
        ["2 (Summer)", "+0.48", "-0.32", "-0.23", "Heat remains positive; humidity and wind suppress demand."],
        ["3 (Fall)", "-0.03", "-0.32", "-0.20", "Extreme heat reduces cycling desire; temperature loses linear correlation."],
        ["4 (Winter)", "+0.40", "-0.29", "-0.15", "Cooler days dampen ridership; moderate warmth boosts rentals."]
    ]
    t_season = Table([[Paragraph(c, tbl_bold if r==0 else tbl_text) for c in row] for r, row in enumerate(exp4_season_data)],
                     colWidths=[55, 65, 65, 80, 287])
    t_season.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e1f5fe')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
    ]))
    story.append(t_season)
    story.append(Spacer(1, 2))
    story.append(output_box("<b>Summary:</b> Temperature is the single most dominant driver of bike rentals (r = +0.63 overall, up to +0.67 in Spring). Windspeed (r = -0.23) and high humidity (r = -0.10) consistently suppress demand.", 552))

    story.append(PageBreak())

    # =========================================================================
    # EXPERIMENT 5
    # =========================================================================
    story.append(Paragraph("Experiment 5: Which Visualization Should Be Used?", title_style))
    story.append(Paragraph("A streaming company wants to understand its content library and make decisions about future content production.", desc_style))

    exp5_c1 = """import kagglehub, pandas as pd, matplotlib.pyplot as plt, seaborn as sns
path = kagglehub.dataset_download("shivamb/netflix-shows")
df = pd.read_csv(glob.glob(os.path.join(path, "*.csv"))[0])
df["date_added"] = pd.to_datetime(df["date_added"], errors="coerce")"""

    exp5_table = [
        ["Analytical Question", "Key Variables", "Selected Visualization", "Alternative Option"],
        ["Content changed over time", "date_added, type", "Line Chart", "Area Chart"],
        ["Countries producing most content", "country", "Bar Chart", "Treemap"],
        ["Most common genres", "listed_in", "Bar Chart", "Word Cloud"],
        ["Movies vs TV Shows", "type", "Count Plot / Bar Chart", "Pie Chart"],
        ["Distribution of ratings", "rating", "Bar Chart", "Pie Chart"]
    ]
    t_exp5 = Table([[Paragraph(c, tbl_bold if r==0 else tbl_text) for c in row] for r, row in enumerate(exp5_table)],
                   colWidths=[150, 100, 145, 157])
    t_exp5.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#fce4ec')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
    ]))

    story.append(Paragraph("1 & 2) Dataset Setup & Visualization Selection Framework", sec_style))
    story.append(code_box(exp5_c1, 552))
    story.append(Spacer(1, 2))
    story.append(t_exp5)
    story.append(Spacer(1, 3))

    story.append(Paragraph("3 & 4) Production Analysis Visualizations & Charts", sec_style))
    exp5_p1 = [
        Image("output_pdf/charts/exp5_timeline.png", width=265, height=125),
        Paragraph("<b>1. Growth Over Time:</b> Massive acceleration post-2015 peaking in 2019 (~2,000 titles added).", text_style)
    ]
    exp5_p2 = [
        Image("output_pdf/charts/exp5_countries.png", width=265, height=125),
        Paragraph("<b>2. Top Production:</b> US leads dramatically (3,690), followed by India (1,046) and UK (803).", text_style)
    ]
    story.append(side_by_side(exp5_p1, exp5_p2, 273, 273))
    story.append(Spacer(1, 3))

    exp5_p3 = [
        Image("output_pdf/charts/exp5_genres.png", width=265, height=120),
        Paragraph("<b>3. Top Genres:</b> International Movies (2,752), Dramas (2,427), and Comedies dominate library.", text_style)
    ]
    exp5_p4 = [
        Image("output_pdf/charts/exp5_ratings.png", width=265, height=120),
        Paragraph("<b>4. Maturity Ratings & Split:</b> TV-MA and TV-14 lead content ratings. Movies outnumber TV Shows ~2.3:1.", text_style)
    ]
    story.append(side_by_side(exp5_p3, exp5_p4, 273, 273))
    story.append(Spacer(1, 2))

    story.append(output_box("<b>Summary Interpretation:</b> Bar charts are optimal for categorical comparisons across discrete items (countries, genres, ratings), whereas continuous time-series trajectories require line charts to depict momentum and change.", 552))

    story.append(PageBreak())

    # =========================================================================
    # EXPERIMENT 6
    # =========================================================================
    story.append(Paragraph("Experiment 6: Can Raw Data Be Trusted?", title_style))
    story.append(Paragraph("Perform a complete data-quality audit and prepare raw retail data for reliable analysis.", desc_style))

    exp6_c1 = """import kagglehub, pandas as pd, glob, os
path = kagglehub.dataset_download("mohammadtalib786/retail-sales-dataset")
df = pd.read_csv(glob.glob(os.path.join(path, "*.csv"))[0])
print("Initial Shape:", df.shape) # (1000, 9)
# Data Quality Audit: Missing, Duplicates, Types, Categorical checks
print("Missing:", df.isnull().sum().to_dict())
print("Duplicates:", df.duplicated().sum())"""

    exp6_o1 = """<class 'pandas.DataFrame'> RangeIndex: 1000 entries, 0 to 999 (9 columns)
Columns: ['Transaction ID', 'Date', 'Customer ID', 'Gender', 'Age', 'Product Category', 'Quantity', 'Price per Unit', 'Total Amount']
Missing Values: All 0 | Duplicates: 0 | Data Types: int64(5), object/str(4)
Categorical Uniques: Gender: 2 ('Male','Female') | Category: 3 ('Beauty','Clothing','Electronics')"""

    story.append(Paragraph("1 & 2) Load, Inspect & Quality Audit", sec_style))
    story.append(side_by_side(code_box(exp6_c1, 273), output_box(exp6_o1, 273)))
    story.append(Spacer(1, 3))

    story.append(Paragraph("3 & 4) Data Cleaning Pipeline & Pre vs Post Quality Check", sec_style))
    exp6_clean_c = """# Cleaning Operations Pipeline
before = df.shape
df = df.dropna()                         # 1. Remove missing values
df = df.drop_duplicates()                 # 2. Remove duplicates
if "Date" in df.columns:
  df["Date"] = pd.to_datetime(df["Date"], errors="coerce") # 3. Datatype conversion
for col in df.select_dtypes("number"):    # 4. Filter invalid negative values
  df = df[df[col] >= 0]
print(f"Cleaned Shape: {df.shape}")"""

    exp6_audit_tbl = [
        ["Data Quality Dimension", "Before Cleaning", "After Cleaning", "Applied Pipeline Action"],
        ["Row Count", "1,000", "1,000", "Zero corrupt/empty records detected."],
        ["Column Count", "9", "9", "Schema fully intact and preserved."],
        ["Missing / Null Values", "0", "0", "Verified via .isnull().sum().sum()."],
        ["Duplicate Rows", "0", "0", "Verified via .drop_duplicates()."],
        ["Date Field Type", "Object / String", "datetime64[ns]", "Converted via pd.to_datetime()."],
        ["Numeric Validity Check", "Unverified", "All >= 0 (Valid)", "Ensured non-negative Quantity & Amount."]
    ]
    t_exp6 = Table([[Paragraph(c, tbl_bold if r==0 else tbl_text) for c in row] for r, row in enumerate(exp6_audit_tbl)],
                   colWidths=[105, 75, 75, 297])
    t_exp6.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#efebe9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
    ]))

    story.append(side_by_side(code_box(exp6_clean_c, 240), t_exp6, 240, 308))
    story.append(Spacer(1, 3))

    story.append(Paragraph("Final Data Quality Report", sec_style))
    story.append(output_box("""===== DATA QUALITY REPORT =====
Rows after cleaning: 1000 | Columns: 9 | Missing values: 0 | Duplicate rows: 0
Invalid numeric values: Verified None (Removed if negative) | Datatype correction: Date converted to datetime
Cleaning decisions: Handled missing rows, dropped duplicates, strictly formatted dates, and enforced numeric validity.""", 552))

    story.append(PageBreak())

    # =========================================================================
    # EXPERIMENT 7
    # =========================================================================
    story.append(Paragraph("Experiment 7: How Do You Convert Raw Transactions into Business Insights?", title_style))
    story.append(Paragraph("Transform raw transaction data into meaningful business information using data wrangling techniques.", desc_style))

    exp7_c1 = """import kagglehub, pandas as pd, glob, os
path = kagglehub.dataset_download("vivek468/superstore-dataset-final")
df = pd.read_csv(glob.glob(os.path.join(path, "*.csv"))[0], encoding="latin1")
df.columns = df.columns.str.strip()
# 1. Feature Engineering: Profit Margin Percentage
df["Profit Margin"] = (df["Profit"] / df["Sales"]) * 100
# 2. Aggregations & Pivots
display(df.groupby("Category")[["Sales", "Profit"]].sum())
display(df.groupby("Region")["Profit"].sum().sort_values(ascending=False))
display(df.groupby("Segment")["Sales"].sum().sort_values(ascending=False))"""

    story.append(Paragraph("1 & 2) Load Dataset, Feature Engineering & Multi-Dimensional Aggregation", sec_style))
    story.append(code_box(exp7_c1, 552))
    story.append(Spacer(1, 2))

    exp7_pivots_data = [
        ["Category", "Central Sales", "East Sales", "South Sales", "West Sales", "Total Profit"],
        ["Furniture", "$163,797.16", "$208,291.20", "$117,298.68", "$252,612.74", "$18,451.27"],
        ["Office Supplies", "$167,026.42", "$205,516.06", "$125,651.31", "$220,853.25", "$122,490.80"],
        ["Technology", "$170,416.31", "$264,973.98", "$148,771.91", "$251,991.83", "$145,454.95"]
    ]
    t_exp7_p1 = Table([[Paragraph(c, tbl_bold if r==0 else tbl_text) for c in row] for r, row in enumerate(exp7_pivots_data)],
                      colWidths=[92, 92, 92, 92, 92, 92])
    t_exp7_p1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e8f5e9')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
    ]))
    story.append(t_exp7_p1)
    story.append(Spacer(1, 3))

    story.append(Paragraph("3) Discount vs Profit Sensitivity & High-Loss Products", sec_style))
    disc_data = [
        ["Discount", "Avg Sales ($)", "Avg Profit ($)", "Analytical Observation"],
        ["0% - 10%", "$226 - $578", "+$66 to +$96", "Highly profitable, standard transaction healthy margins."],
        ["15% - 20%", "$530 - $209", "+$27 to +$25", "Diminishing profit margins, acceptable for inventory turnover."],
        ["30% - 50%", "$454 - $892", "-$45 to -$310", "Destructive discount threshold: volume surges while hemorrhaging cash."],
        ["60% - 80%", "$48 - $56", "-$43 to -$102", "Severe loss per unit sold; completely unsustainable liquidation pricing."]
    ]
    t_disc = Table([[Paragraph(c, tbl_bold if r==0 else tbl_text) for c in row] for r, row in enumerate(disc_data)],
                   colWidths=[65, 80, 80, 327])
    t_disc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#ffebee')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
    ]))
    story.append(t_disc)
    story.append(Spacer(1, 2))

    story.append(output_box("""Top High-Sales, Negative-Profit Products:
• Cubify CubeX 3D Printer Double Head: Sales $11,099.96 | Profit: -$8,879.97
• Lexmark MX611dhe Monochrome Laser: Sales $16,829.90 | Profit: -$4,589.97
• Chromcraft Bull-Nose Wood Oval Table: Sales $9,917.64 | Profit: -$2,876.12
• Cisco TelePresence System EX90: Sales $22,638.48 | Profit: -$1,811.08""", 552))
    story.append(Spacer(1, 2))

    story.append(output_box("""<b>EXECUTIVE BUSINESS INSIGHTS & RECOMMENDATIONS:</b><br/>
1. <b>Highest Sales & Profit Category:</b> Technology ($836,154 sales, $145,455 profit).<br/>
2. <b>Most Profitable Region:</b> West ($108,418 profit), followed by East ($91,523). Central lags significantly ($39,706).<br/>
3. <b>Highest Revenue Segment:</b> Consumer ($1,161,401 sales), generating over 50% of aggregate volume.<br/>
4. <b>Discount-Profit Correlation:</b> <b>-0.22</b> (Excessive discounting drives negative return; 1,871 transactions operated at a net loss).<br/>
5. <b>Actionable Recommendations:</b> Cap standard discounts at 20%; audit high-loss equipment (printers/tables); study West region operational practices.""", 552))

    story.append(PageBreak())

    # =========================================================================
    # EXPERIMENT 8
    # =========================================================================
    story.append(Paragraph("Experiment 8: Complete Exploratory Data Analysis of Student Performance", title_style))
    story.append(Paragraph("Perform a complete exploratory data analysis to identify academic, demographic, and behavioral patterns associated with student performance.", desc_style))

    exp8_c1 = """import kagglehub, pandas as pd, glob, os, matplotlib.pyplot as plt, seaborn as sns
df = pd.read_csv(glob.glob(os.path.join(path, "*.csv"))[0])
df["Average"] = df[["math score", "reading score", "writing score"]].mean(axis=1)
# Shape: (1000, 8) | Nulls: 0 | Duplicates: 0"""

    story.append(Paragraph("1 & 2) Ingestion & Univariate Distribution Analysis", sec_style))
    story.append(side_by_side(
        code_box(exp8_c1 + """\n# Univariate plots:\nfig, ax = plt.subplots(2,2,figsize=(12,8))\nsns.countplot(data=df, x="gender", ax=ax[0,0])\nsns.countplot(data=df, x="parental level of education", ax=ax[0,1])\nsns.countplot(data=df, x="test preparation course", ax=ax[1,0])\nsns.histplot(df[["math score","reading score","writing score"]], ax=ax[1,1])\nplt.show()""", 273),
        Image("output_pdf/charts/exp8_univariate.png", width=270, height=135),
        273, 273
    ))
    story.append(Spacer(1, 3))

    story.append(Paragraph("3 & 4) Bivariate & Multivariate Analysis", sec_style))
    story.append(Image("output_pdf/charts/exp8_bivariate.png", width=552, height=110))
    story.append(Spacer(1, 2))

    story.append(side_by_side(
        Image("output_pdf/charts/exp8_heatmap.png", width=265, height=125),
        Image("output_pdf/charts/exp8_multivariate.png", width=265, height=125),
        273, 273
    ))
    story.append(Spacer(1, 2))

    exp8_findings = """<b>FIVE EMPIRICAL FINDINGS:</b><br/>
1. <b>Gender:</b> Females achieved higher overall averages (69.57 vs 65.84) driven by higher reading and writing marks.<br/>
2. <b>Test Preparation:</b> Course completion provided a massive boost (+7.63 pts: 72.67 completed vs 65.04 none).<br/>
3. <b>Parental Education:</b> Strongly correlated with performance (Master's degree: 73.60, Bachelor's: 71.92 vs High School: 63.10).<br/>
4. <b>Lunch Subsidy (Economic Status):</b> Standard lunch scored 70.84 vs Free/Reduced lunch at 62.20 (-8.64 point socio-economic penalty).<br/>
5. <b>Subject Synergy:</b> Reading and writing are exceptionally correlated (r = 0.95); math correlates with overall average at r = 0.92.<br/>
<b>THREE STRATEGIC RECOMMENDATIONS:</b><br/>
1. Institutionalize subsidized test-preparation workshops for students from economically disadvantaged lunch backgrounds.<br/>
2. Offer targeted math remediation clinics, as math exhibits the lowest overall average (66.09) and greatest score variance.<br/>
3. Form peer study cohorts linking first-generation college students with advanced subject mentors."""
    story.append(output_box(exp8_findings, 552))

    story.append(PageBreak())

    # =========================================================================
    # EXPERIMENT 9
    # =========================================================================
    story.append(Paragraph("Experiment 9: Does Aggregated Data Hide the Truth?", title_style))
    story.append(Paragraph("Investigate whether the relationship between economic development and happiness remains consistent across geographical or regional groups (Simpson's Paradox & Ecological Fallacy).", desc_style))

    exp9_c1 = """import kagglehub, pandas as pd, glob, os, seaborn as sns, matplotlib.pyplot as plt
path = kagglehub.dataset_download("unsdsn/world-happiness")
df = pd.read_csv(files[0]) # 158 nations
overall_corr = data[gdp].corr(data[happiness])
print("Overall Correlation:", round(overall_corr, 3)) # 0.781"""

    exp9_group_data = [
        ["Region / Group", "Countries", "Correlation (GDP vs Happiness)", "Behavior Relative to Global Trend"],
        ["Overall Global Dataset", "158", "+0.781 (Strong Positive)", "Aggregated view suggests wealth uniformly drives happiness."],
        ["Australia and New Zealand", "2", "-1.000 (Negative)", "Micro-sample reversal: local variations oppose macro trend."],
        ["Central and Eastern Europe", "29", "+0.350 (Weak Positive)", "Substantially lower correlation than global average."],
        ["Eastern Asia", "6", "+0.784 (Strong Positive)", "Tracks global trend closely."],
        ["Latin America and Caribbean", "22", "+0.731 (Strong Positive)", "High happiness even at intermediate economic tiers."],
        ["Middle East & Northern Africa", "20", "+0.830 (Very Strong)", "Steep happiness increase per unit GDP growth."],
        ["North America", "2", "-1.000 (Negative)", "Reversal: GDP difference does not explain happiness delta."],
        ["Southeastern Asia", "9", "+0.896 (Very Strong)", "Strongest regional positive linearity."],
        ["Southern Asia", "7", "+0.446 (Moderate)", "Moderate positive slope."],
        ["Sub-Saharan Africa", "40", "+0.345 (Weak Positive)", "Wide dispersion; basic needs and governance overshadow GDP."],
        ["Western Europe", "21", "+0.720 (Strong Positive)", "High baseline happiness across homogeneous high GDP."]
    ]
    t_exp9 = Table([[Paragraph(c, tbl_bold if r==0 else tbl_text) for c in row] for r, row in enumerate(exp9_group_data)],
                   colWidths=[125, 45, 115, 267])
    t_exp9.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#ede7f6')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#f3e5f5')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cccccc')),
        ('TOPPADDING', (0,0), (-1,-1), 1.2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.2),
        ('ALIGN', (1,0), (2,-1), 'CENTER'),
    ]))

    story.append(Paragraph("1 & 2) Global Aggregation vs Regional Group Breakdown", sec_style))
    story.append(side_by_side(
        code_box(exp9_c1 + """\n# Overall scatterplot:\nsns.regplot(data=data, x=gdp, y=happiness)\nplt.title("Overall GDP vs Happiness")\nplt.show()\n# Group loop:\nfor group, part in df.groupby("Group"):\n  r = part[gdp].corr(part[happiness])""", 255),
        Image("output_pdf/charts/exp9_overall.png", width=285, height=130),
        258, 288
    ))
    story.append(Spacer(1, 2))
    story.append(t_exp9)
    story.append(Spacer(1, 2))

    exp9_conc = """<b>INTERPRETATION & METHODOLOGICAL CONCLUSION:</b><br/>
• <b>The Fallacy of Aggregation:</b> While the worldwide correlation is strongly positive (+0.781), subgroup correlations range wildly from -1.000 to +0.896, with major regions like Sub-Saharan Africa (+0.345) and Central/Eastern Europe (+0.350) showing far weaker dependencies.<br/>
• <b>Conclusion:</b> <b>Yes, aggregated data conceals critical truths.</b> Assuming individual regional behavior mirrors aggregate statistics is an Ecological Fallacy. Policymakers must evaluate localized drivers rather than blanket global assumptions. Correlation does not prove causation."""
    story.append(output_box(exp9_conc, 552))

    story.append(PageBreak())

    # =========================================================================
    # EXPERIMENT 10
    # =========================================================================
    story.append(Paragraph("Experiment 10: Can Visualization Support Hotel Management Decisions?", title_style))
    story.append(Paragraph("Develop a complete visualization portfolio to understand hotel booking behavior, cancellation patterns, customer segments, and seasonal demand.", desc_style))

    exp10_c1 = """import kagglehub, pandas as pd, glob, os, matplotlib.pyplot as plt, seaborn as sns
path = kagglehub.dataset_download("jessemostipak/hotel-booking-demand")
df = pd.read_csv(glob.glob(os.path.join(path, "*.csv"))[0]) # 119,390 rows, 34 columns
df["arrival_date"] = pd.to_datetime(df["arrival_date_year"].astype(str)+"-"+df["arrival_date_month"]+"-01")
df["total_nights"] = df["stays_in_weekend_nights"] + df["stays_in_week_nights"]"""

    story.append(Paragraph("1) Ingestion, Feature Engineering & Time-Series Demand", sec_style))
    story.append(side_by_side(
        code_box(exp10_c1 + """\n# Time Series Plot:\ndf.groupby("arrival_date")["hotel"].count().plot(figsize=(10,4))\nplt.title("Hotel Booking Demand Over Time")\nplt.show()""", 273),
        Image("output_pdf/charts/exp10_demand.png", width=270, height=120),
        273, 273
    ))
    story.append(Spacer(1, 3))

    story.append(Paragraph("2 & 3) Segmentation, Distributions & Cancellation Drivers", sec_style))
    story.append(side_by_side(
        Image("output_pdf/charts/exp10_types.png", width=270, height=115),
        Image("output_pdf/charts/exp10_distribution.png", width=270, height=115),
        273, 273
    ))
    story.append(Spacer(1, 2))

    story.append(Paragraph("4 & 5) Advanced Pivot Heatmap & Executive Decision Metrics", sec_style))
    exp10_heat_side = [
        Image("output_pdf/charts/exp10_heatmap.png", width=265, height=125)
    ]
    exp10_table_side = [
        Paragraph("<b>Key Decision Metrics:</b>", text_style),
        output_box("""• Cancellation Rate by Hotel:
  - City Hotel: 41.73% | Resort Hotel: 27.76%
• Average Length of Stay:
  - City Hotel: 2.98 nights | Resort Hotel: 4.32 nights
• Special Requests vs Cancellation:
  - 0 Requests: 47.72% Canceled
  - 1 Request:  22.02% Canceled
  - 2 Requests: 22.10% Canceled
  - 3 Requests: 17.86% Canceled
  - 4 Requests: 10.59% Canceled
  - 5 Requests:  5.00% Canceled""", 270)
    ]
    story.append(side_by_side(exp10_heat_side, exp10_table_side, 273, 273))
    story.append(Spacer(1, 2))

    exp10_summary = """<b>EXECUTIVE DECISION PORTFOLIO TAKEAWAYS:</b><br/>
1. <b>Overbooking & Cancellation Risk:</b> City Hotel faces severe cancellation (41.7%) and group bookings have a staggering 68.9% cancellation rate. Management must institute non-refundable deposit policies for group reservations.<br/>
2. <b>Lead Time Risk Indicator:</b> Longer lead times exhibit dramatically higher cancellation probabilities. Automated engagement emails should be deployed for bookings made > 100 days in advance.<br/>
3. <b>Guest Engagement Lever:</b> Special requests serve as an inverse proxy for cancellation (guests with 0 requests cancel at 47.7%, falling to 5.0% for 5 requests). Encouraging pre-arrival personalization directly protects booking revenue."""
    story.append(output_box(exp10_summary, 552))

    doc.build(story, canvasmaker=NumberedCanvas)
    print("Condensed PDF successfully generated:", filename)

if __name__ == "__main__":
    build_pdf("output_pdf/Data_Analysis_Experiments_Condensed.pdf")
