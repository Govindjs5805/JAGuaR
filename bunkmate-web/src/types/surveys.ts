export interface Survey {
  id: number;
  name: string;
  summary: string;
  academic_year: string;
  start_at: string;
  end_at: string;
  time_required: number | null;
  survey_type: string;
  survey_mode: string;
  pivot: {
    start_at: string | null;
    end_at: string | null;
  };
}
