export interface JiraTicket {
  key: string;
  id: string;
  summary: string;
  issuetype: string;
  status: string;
  priorityRank: string;
  priorityName: string;
  created: string;
  updated: string;
  assignee: string;
  reporter: string;
  components: string[];
  labels: string[];
  severity: string;
  project: string;
  supplier: string[];
  links: TicketLink[];
}

export interface TicketLink {
  key: string;
  direction: string;
  type: string;
  status: string;
  summary: string;
}

export interface GraphNode {
  id: string;
  color: string;
  val: number;
  data: JiraTicket;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
}

export interface Filters {
  severity: string[];
  labels: string[];
  components: string[];
  supplier: string[];
}