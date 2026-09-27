export const FORM_SUBMISSION_TABLE = 'form_submissions';

export interface FormSubmission {
  id: number;
  organization_id: number | null;
  form_id: number | string | null;
  form_type: string | null;
  form_data: any;
  media_list: any;
  status: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFormSubmissionInput {
  form_id?: number | string | null;
  form_type?: string | null;
  form_data?: any;
  status?: string | null;
}

export interface UpdateFormSubmissionInput extends CreateFormSubmissionInput {}
