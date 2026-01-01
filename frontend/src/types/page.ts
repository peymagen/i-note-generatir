export interface Page {
  id: number;
  title: string;
  content: string;
  created_on: string;
  updated_on: string;
}

export interface Props {
  pageId?: string;
  isNew?: boolean;
 
  initialData?: {
    title: string;
    content: string;
  };
  inline?: boolean;
}


