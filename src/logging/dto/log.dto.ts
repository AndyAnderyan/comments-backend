export interface LogDto {
  userId: string;
  actionType: string;
  targetId?: string;
  payloadBefore?: any;
  payloadAfter?: any;
  payloadInfo?: string;
}
