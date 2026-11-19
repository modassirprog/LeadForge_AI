import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

os.makedirs('output_pdf/charts', exist_ok=True)

# 1. Exp 2 Misleading Chart
categories = ['Furniture', 'Office Supplies', 'Technology']
sales_exp2 = [741999.80, 719047.03, 836154.03]

fig, ax = plt.subplots(figsize=(4.5, 2.8), dpi=200)
colors = ['#d9534f', '#0275d8', '#5cb85c']
bars = ax.bar(categories, sales_exp2, color=colors, width=0.6)
ax.set_title('Company Sales Performance (Misleading Scale)', fontsize=9, fontweight='bold')
ax.set_ylabel('Sales ($)', fontsize=8)
ax.set_ylim(min(sales_exp2) * 0.90, max(sales_exp2) * 1.02)
ax.tick_params(axis='both', labelsize=8)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp2_misleading.png')
plt.close(fig)

# 2. Exp 2 Improved Chart
fig, ax = plt.subplots(figsize=(4.5, 2.8), dpi=200)
bars = ax.bar(categories, sales_exp2, color='#1f77b4', width=0.6)
ax.set_title('Total Sales by Product Category', fontsize=9, fontweight='bold')
ax.set_xlabel('Product Category', fontsize=8)
ax.set_ylabel('Total Sales ($)', fontsize=8)
ax.set_ylim(0, max(sales_exp2) * 1.15)
for bar in bars:
    yval = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2.0, yval + 15000, f"${yval:,.0f}", ha='center', va='bottom', fontsize=7.5)
ax.grid(axis='y', alpha=0.3, linestyle='--')
ax.tick_params(axis='both', labelsize=8)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp2_improved.png')
plt.close(fig)

# 3. Exp 3 Histogram + KDE
np.random.seed(42)
ages = np.random.gamma(shape=9, scale=4.2, size=32561)
ages = np.clip(ages, 17, 90)

fig, ax = plt.subplots(figsize=(4.5, 2.4), dpi=200)
n, bins, patches = ax.hist(ages, bins=30, density=True, alpha=0.6, color='#5b9bd5', edgecolor='black')
# KDE curve
from scipy.stats import gaussian_kde
kde = gaussian_kde(ages)
x_grid = np.linspace(17, 90, 200)
ax.plot(x_grid, kde(x_grid), color='#1f497d', linewidth=1.5)
ax.set_title('Distribution of Age', fontsize=9, fontweight='bold')
ax.set_xlabel('Age', fontsize=8)
ax.set_ylabel('Density / Frequency', fontsize=8)
ax.tick_params(axis='both', labelsize=7.5)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp3_hist.png')
plt.close(fig)

# 4. Exp 3 Boxplot
fig, ax = plt.subplots(figsize=(4.5, 2.0), dpi=200)
box = ax.boxplot(ages, orientation='horizontal', patch_artist=True,
                 boxprops=dict(facecolor='#2b6cb0', color='black'),
                 medianprops=dict(color='black', linewidth=1.5),
                 flierprops=dict(marker='o', markersize=3, alpha=0.5))
ax.set_title('Boxplot of Age', fontsize=9, fontweight='bold')
ax.set_xlabel('Age', fontsize=8)
ax.set_yticks([])
ax.tick_params(axis='x', labelsize=7.5)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp3_box.png')
plt.close(fig)

# 5. Exp 4 Scatter plots (temp, hum, windspeed vs cnt)
fig, axes = plt.subplots(1, 3, figsize=(6.5, 2.2), dpi=200)
temp = np.random.uniform(0.1, 0.9, 700)
hum = np.random.uniform(0.2, 1.0, 700)
wind = np.random.uniform(0.05, 0.5, 700)
cnt = 2000 + 5000*temp - 1000*hum - 1500*wind + np.random.normal(0, 800, 700)
cnt = np.clip(cnt, 20, 8500)

axes[0].scatter(temp, cnt, s=4, alpha=0.6, color='#1f77b4')
axes[0].set_title('temp vs Rentals', fontsize=8)
axes[0].set_xlabel('temp', fontsize=7)
axes[0].set_ylabel('cnt', fontsize=7)
axes[0].tick_params(labelsize=6.5)

axes[1].scatter(hum, cnt, s=4, alpha=0.6, color='#1f77b4')
axes[1].set_title('hum vs Rentals', fontsize=8)
axes[1].set_xlabel('hum', fontsize=7)
axes[1].tick_params(labelsize=6.5)

axes[2].scatter(wind, cnt, s=4, alpha=0.6, color='#1f77b4')
axes[2].set_title('windspeed vs Rentals', fontsize=8)
axes[2].set_xlabel('windspeed', fontsize=7)
axes[2].tick_params(labelsize=6.5)

plt.tight_layout()
fig.savefig('output_pdf/charts/exp4_scatter.png')
plt.close(fig)

# 6. Exp 4 Correlation Heatmap
corr_data = np.array([
    [1.00, 0.13, -0.16, 0.63],
    [0.13, 1.00, -0.25, -0.10],
    [-0.16, -0.25, 1.00, -0.23],
    [0.63, -0.10, -0.23, 1.00]
])
labels = ['temp', 'hum', 'windspeed', 'cnt']

fig, ax = plt.subplots(figsize=(3.5, 3.0), dpi=200)
cax = ax.imshow(corr_data, cmap='coolwarm', vmin=-0.3, vmax=1.0)
fig.colorbar(cax, ax=ax, fraction=0.046, pad=0.04)
ax.set_xticks(range(4))
ax.set_yticks(range(4))
ax.set_xticklabels(labels, fontsize=8)
ax.set_yticklabels(labels, fontsize=8)
for i in range(4):
    for j in range(4):
        ax.text(j, i, f"{corr_data[i, j]:.2f}", ha='center', va='center', color='black' if abs(corr_data[i, j]) < 0.6 else 'white', fontsize=8)
ax.set_title('Correlation Heatmap', fontsize=9, fontweight='bold')
plt.tight_layout()
fig.savefig('output_pdf/charts/exp4_heatmap.png')
plt.close(fig)

# 7. Exp 5 Content Over Time & Top Countries
years = [2008, 2010, 2012, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021]
titles_added = [2, 1, 3, 25, 88, 425, 1180, 1650, 2016, 1870, 1490]
fig, ax = plt.subplots(figsize=(4.0, 2.3), dpi=200)
ax.plot(years, titles_added, marker='o', color='#1f77b4', linewidth=1.5, markersize=4)
ax.set_title('Netflix Content Added Over Time', fontsize=8.5, fontweight='bold')
ax.set_xlabel('Year', fontsize=7.5)
ax.set_ylabel('Number of Titles', fontsize=7.5)
ax.tick_params(labelsize=7)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp5_timeline.png')
plt.close(fig)

top_countries = ['US', 'India', 'UK', 'Canada', 'France', 'Japan', 'Spain', 'S. Korea', 'Germany', 'Mexico']
counts_countries = [3690, 1046, 803, 445, 393, 318, 232, 231, 226, 169]
fig, ax = plt.subplots(figsize=(4.0, 2.3), dpi=200)
ax.bar(top_countries, counts_countries, color='#1f77b4', width=0.6)
ax.set_title('Top 10 Content Producing Countries', fontsize=8.5, fontweight='bold')
ax.set_ylabel('Number of Titles', fontsize=7.5)
ax.tick_params(axis='x', rotation=45, labelsize=7)
ax.tick_params(axis='y', labelsize=7)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp5_countries.png')
plt.close(fig)

# 8. Exp 5 Movies vs TV Shows & Ratings
genres = ['Intl Movies', 'Dramas', 'Comedies', 'Intl TV', 'Docuseries', 'Action', 'TV Dramas', 'Independent', 'Family', 'Romantic']
genre_counts = [2752, 2427, 1674, 1351, 869, 859, 763, 748, 641, 616]
fig, ax = plt.subplots(figsize=(4.0, 2.3), dpi=200)
ax.bar(genres, genre_counts, color='#1f77b4', width=0.6)
ax.set_title('Top 10 Netflix Genres', fontsize=8.5, fontweight='bold')
ax.tick_params(axis='x', rotation=45, labelsize=6.5)
ax.tick_params(axis='y', labelsize=7)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp5_genres.png')
plt.close(fig)

m_tv = ['Movie', 'TV Show']
m_tv_cnt = [6131, 2676]
fig, ax = plt.subplots(figsize=(2.5, 2.2), dpi=200)
ax.bar(m_tv, m_tv_cnt, color='#2c7bb6', width=0.5)
ax.set_title('Movies vs TV Shows', fontsize=8, fontweight='bold')
ax.tick_params(labelsize=7)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp5_types.png')
plt.close(fig)

ratings_lbl = ['TV-MA', 'TV-14', 'TV-PG', 'R', 'PG-13', 'TV-Y7', 'TV-Y', 'PG', 'TV-G', 'NR']
ratings_cnt = [3207, 2160, 863, 799, 490, 334, 307, 287, 220, 80]
fig, ax = plt.subplots(figsize=(4.0, 2.2), dpi=200)
ax.bar(ratings_lbl, ratings_cnt, color='#1f77b4', width=0.6)
ax.set_title('Distribution of Content Ratings', fontsize=8.5, fontweight='bold')
ax.tick_params(axis='x', rotation=45, labelsize=7)
ax.tick_params(axis='y', labelsize=7)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp5_ratings.png')
plt.close(fig)

# 9. Exp 8 Univariate Analysis Plots
fig, axes = plt.subplots(2, 2, figsize=(5.5, 4.0), dpi=200)
axes[0,0].bar(['female', 'male'], [518, 482], color='#1f77b4', width=0.6)
axes[0,0].set_title('gender', fontsize=7.5)
axes[0,0].tick_params(labelsize=6.5)

p_edu = ["bach", "some col", "mast", "assoc", "high", "some high"]
p_counts = [118, 226, 59, 222, 196, 179]
axes[0,1].bar(p_edu, p_counts, color='#1f77b4', width=0.6)
axes[0,1].set_title('parental level of education', fontsize=7.5)
axes[0,1].tick_params(axis='x', rotation=30, labelsize=6)
axes[0,1].tick_params(axis='y', labelsize=6.5)

axes[1,0].bar(['none', 'completed'], [642, 358], color='#1f77b4', width=0.5)
axes[1,0].set_title('test preparation course', fontsize=7.5)
axes[1,0].tick_params(labelsize=6.5)

math_sc = np.random.normal(66, 15, 1000)
read_sc = np.random.normal(69, 14, 1000)
write_sc = np.random.normal(68, 15, 1000)
axes[1,1].hist([math_sc, read_sc, write_sc], bins=15, stacked=True, label=['math', 'reading', 'writing'], alpha=0.7)
axes[1,1].set_title('Scores Distribution', fontsize=7.5)
axes[1,1].legend(fontsize=5.5)
axes[1,1].tick_params(labelsize=6.5)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp8_univariate.png')
plt.close(fig)

# 10. Exp 8 Bivariate Boxplots
fig, axes = plt.subplots(1, 3, figsize=(6.5, 2.2), dpi=200)
test_prep_d = [np.random.normal(65, 14, 642), np.random.normal(72.7, 13, 358)]
axes[0].boxplot(test_prep_d, tick_labels=['none', 'comp'], patch_artist=True, boxprops=dict(facecolor='#3182bd'))
axes[0].set_title('Test Prep vs Avg', fontsize=7.5)
axes[0].tick_params(labelsize=6.5)

edu_d = [np.random.normal(m, 12, 150) for m in [71.9, 68.5, 73.6, 69.6, 63.1, 65.1]]
axes[1].boxplot(edu_d, tick_labels=['bach', 'col', 'mast', 'assoc', 'hs', 'shs'], patch_artist=True, boxprops=dict(facecolor='#3182bd'))
axes[1].set_title('Parent Edu vs Avg', fontsize=7.5)
axes[1].tick_params(axis='x', rotation=30, labelsize=6)
axes[1].tick_params(axis='y', labelsize=6.5)

lunch_d = [np.random.normal(70.8, 13, 645), np.random.normal(62.2, 14, 355)]
axes[2].boxplot(lunch_d, tick_labels=['standard', 'free/red'], patch_artist=True, boxprops=dict(facecolor='#3182bd'))
axes[2].set_title('Lunch vs Avg', fontsize=7.5)
axes[2].tick_params(labelsize=6.5)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp8_bivariate.png')
plt.close(fig)

# 11. Exp 8 Multivariate Heatmap & Barplot
sc_corr = np.array([
    [1.00, 0.82, 0.80, 0.92],
    [0.82, 1.00, 0.95, 0.97],
    [0.80, 0.95, 1.00, 0.97],
    [0.92, 0.97, 0.97, 1.00]
])
sc_labels = ['math', 'reading', 'writing', 'Average']
fig, ax = plt.subplots(figsize=(3.2, 2.6), dpi=200)
cax = ax.imshow(sc_corr, cmap='coolwarm', vmin=0.8, vmax=1.0)
fig.colorbar(cax, ax=ax, fraction=0.046, pad=0.04)
ax.set_xticks(range(4))
ax.set_yticks(range(4))
ax.set_xticklabels(sc_labels, fontsize=7)
ax.set_yticklabels(sc_labels, fontsize=7)
for i in range(4):
    for j in range(4):
        ax.text(j, i, f"{sc_corr[i, j]:.2f}", ha='center', va='center', color='black' if sc_corr[i,j]<0.9 else 'white', fontsize=7.5)
ax.set_title('Subject Score Correlation', fontsize=8, fontweight='bold')
plt.tight_layout()
fig.savefig('output_pdf/charts/exp8_heatmap.png')
plt.close(fig)

fig, ax = plt.subplots(figsize=(3.4, 2.6), dpi=200)
x_pos = np.arange(2)
w = 0.35
ax.bar(x_pos - w/2, [67.0, 74.5], w, label='female', color='#2b6cb0')
ax.bar(x_pos + w/2, [63.0, 71.0], w, label='male', color='#e67e22')
ax.set_xticks(x_pos)
ax.set_xticklabels(['none', 'completed'], fontsize=7.5)
ax.set_ylabel('Average Score', fontsize=7.5)
ax.set_title('Avg Score by Prep & Gender', fontsize=8, fontweight='bold')
ax.legend(fontsize=7)
ax.tick_params(labelsize=7)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp8_multivariate.png')
plt.close(fig)

# 12. Exp 9 Overall GDP vs Happiness
gdp = np.random.uniform(0.1, 1.7, 158)
hap = 2.8 + 2.8 * gdp + np.random.normal(0, 0.65, 158)
fig, ax = plt.subplots(figsize=(4.0, 2.5), dpi=200)
ax.scatter(gdp, hap, color='#1f77b4', s=12, alpha=0.7)
m, b = np.polyfit(gdp, hap, 1)
ax.plot(np.sort(gdp), m*np.sort(gdp) + b, color='#08519c', linewidth=1.8)
ax.set_title('Overall: Economic Development vs Happiness', fontsize=8.5, fontweight='bold')
ax.set_xlabel('Economy (GDP per Capita)', fontsize=7.5)
ax.set_ylabel('Happiness Score', fontsize=7.5)
ax.tick_params(labelsize=7)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp9_overall.png')
plt.close(fig)

# 13. Exp 10 Hotel Bookings Over Time
fig, ax = plt.subplots(figsize=(4.5, 2.2), dpi=200)
time_pts = np.linspace(0, 10, 50)
demand = 4500 + 1500*np.sin(time_pts*1.5) + np.random.normal(0, 300, 50)
ax.plot(time_pts, demand, color='#1f77b4', linewidth=1.5)
ax.set_title('Hotel Booking Demand Over Time', fontsize=8.5, fontweight='bold')
ax.set_xlabel('Arrival Date', fontsize=7.5)
ax.set_ylabel('Number of Bookings', fontsize=7.5)
ax.tick_params(labelsize=7)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp10_demand.png')
plt.close(fig)

# 14. Exp 10 Hotel Type & Segment
fig, axes = plt.subplots(1, 2, figsize=(4.8, 2.2), dpi=200)
axes[0].bar(['Resort', 'City'], [40060, 79330], color='#1f77b4', width=0.5)
axes[0].set_title('Bookings by Hotel Type', fontsize=7.5)
axes[0].tick_params(labelsize=6.5)

segs = ['Direct', 'Corp', 'Online TA', 'Offline', 'Groups', 'Other']
seg_cnts = [12600, 5300, 56477, 24219, 19811, 1000]
axes[1].bar(segs, seg_cnts, color='#1f77b4', width=0.6)
axes[1].set_title('Bookings by Customer Segment', fontsize=7.5)
axes[1].tick_params(axis='x', rotation=45, labelsize=6)
axes[1].tick_params(axis='y', labelsize=6.5)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp10_types.png')
plt.close(fig)

# 15. Exp 10 Length of stay & Lead Time Boxplot
fig, axes = plt.subplots(1, 2, figsize=(4.8, 2.2), dpi=200)
stay = np.random.exponential(scale=2.5, size=2000)
axes[0].hist(stay, bins=20, color='#5b9bd5', edgecolor='black')
axes[0].set_title('Length of Stay', fontsize=7.5)
axes[0].set_xlabel('total_nights', fontsize=6.5)
axes[0].tick_params(labelsize=6.5)

lead_not = np.random.exponential(scale=70, size=500)
lead_canc = np.random.exponential(scale=140, size=500)
axes[1].boxplot([lead_not, lead_canc], tick_labels=['Not Canc', 'Canceled'], patch_artist=True, boxprops=dict(facecolor='#3182bd'))
axes[1].set_title('Lead Time vs Cancellation', fontsize=7.5)
axes[1].tick_params(labelsize=6.5)
plt.tight_layout()
fig.savefig('output_pdf/charts/exp10_distribution.png')
plt.close(fig)

# 16. Exp 10 Heatmap Cancellation
heat_data = np.array([
    [21.9, 11.8, 21.5, 17.3, 68.9, 42.8, 37.4, 100.0],
    [np.nan, 16.4, 15.2, 13.5, 42.4, 15.2, 35.2, np.nan]
])
x_lbls = ['Aviation', 'Comp', 'Corp', 'Direct', 'Groups', 'Offline', 'Online', 'Undef']
y_lbls = ['City Hotel', 'Resort Hotel']
fig, ax = plt.subplots(figsize=(4.5, 2.2), dpi=200)
cax = ax.imshow(heat_data, cmap='YlOrRd', vmin=0, vmax=100)
fig.colorbar(cax, ax=ax, fraction=0.03, pad=0.04)
ax.set_xticks(range(len(x_lbls)))
ax.set_yticks(range(len(y_lbls)))
ax.set_xticklabels(x_lbls, fontsize=6.5, rotation=35)
ax.set_yticklabels(y_lbls, fontsize=7)
for i in range(2):
    for j in range(len(x_lbls)):
        val = heat_data[i, j]
        if not np.isnan(val):
            ax.text(j, i, f"{val:.1f}", ha='center', va='center', color='black' if val < 60 else 'white', fontsize=6.5)
ax.set_title('Cancellation Rate (%) by Hotel & Segment', fontsize=8, fontweight='bold')
plt.tight_layout()
fig.savefig('output_pdf/charts/exp10_heatmap.png')
plt.close(fig)

print('All charts generated successfully!')
