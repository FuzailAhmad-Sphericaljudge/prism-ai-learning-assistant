import csv
import io
from datetime import datetime, timezone
from typing import Any
from api.schemas.educator import EducatorInsightsResponse


class EducatorCsvExporter:
    """
    Serializes aggregated pedagogical telemetry and confusion heatmap analytics into standard CSV.
    """

    @classmethod
    def export_csv(cls, insights: EducatorInsightsResponse) -> str:
        output = io.StringIO()
        writer = csv.writer(output)

        # 1. Metadata Block
        writer.writerow(["# PRISM EDUCATOR COHORT TELEMETRY EXPORT"])
        writer.writerow(["# Exported UTC", datetime.now(timezone.utc).isoformat()])
        writer.writerow(["# Course ID", insights.course_id])
        writer.writerow(["# Active Students", insights.active_students])
        writer.writerow(["# Questions Asked", insights.total_questions_asked])
        writer.writerow(["# Practice Attempts", insights.total_practice_attempts])
        writer.writerow(["# Oral Interviews", insights.total_interviews])
        writer.writerow(["# Avg Course Mastery", f"{insights.avg_course_mastery_percentage}%"])
        writer.writerow([])

        # 2. Confusion Heatmap Table
        writer.writerow(["--- CONFUSION HEATMAP (VIDEO TIMELINE) ---"])
        writer.writerow([
            "Bucket Index",
            "Start Sec",
            "End Sec",
            "Coordinate Label",
            "Learner Questions",
            "Misconceptions Detected",
            "Confusion Intensity (0.0 - 1.0)",
            "Associated Topic",
        ])
        for b in insights.confusion_heatmap:
            writer.writerow([
                b.bucket_index,
                b.start_sec,
                b.end_sec,
                b.coordinate_label,
                b.query_count,
                b.misconception_count,
                b.confusion_intensity,
                b.most_confused_topic,
            ])
        writer.writerow([])

        # 3. Top Misconceptions Table
        writer.writerow(["--- TOP RECURRING MISCONCEPTIONS ---"])
        writer.writerow([
            "Misconception Tag",
            "Curricular Concept",
            "Occurrences",
            "Prevalence Percentage",
            "Lecture Landmark Coordinate",
            "Recommended Remediation Action",
        ])
        for m in insights.top_misconceptions:
            writer.writerow([
                m.misconception_tag,
                m.concept_tag,
                m.occurrences,
                f"{m.prevalence_percentage}%",
                m.landmark_coordinate,
                m.remediation_action,
            ])
        writer.writerow([])

        # 4. Top Learner Questions Table
        writer.writerow(["--- MOST FREQUENT LEARNER INQUIRIES ---"])
        writer.writerow([
            "Question Text",
            "Occurrences",
            "Concept Tag",
            "Playback Coordinate",
            "Timestamp Sec",
        ])
        for q in insights.top_questions:
            writer.writerow([
                q.question,
                q.occurrences,
                q.concept_tag,
                q.playback_coordinate,
                q.timestamp_sec,
            ])
        writer.writerow([])

        # 5. Concept Mastery Distribution Table
        writer.writerow(["--- CONCEPT MASTERY COHORT DISTRIBUTION ---"])
        writer.writerow([
            "Concept Tag",
            "Demonstrated Count",
            "Improving Count",
            "Gap Count",
            "Unassessed Count",
            "Average Score (%)",
        ])
        for c in insights.concept_distributions:
            writer.writerow([
                c.concept_tag,
                c.demonstrated_count,
                c.improving_count,
                c.gap_count,
                c.unassessed_count,
                c.average_score,
            ])

        return output.getvalue()
