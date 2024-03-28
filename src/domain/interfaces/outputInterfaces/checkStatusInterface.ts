import ChecksInterface from "./checksInterface";

export default interface CheckStatusApi {
    name: string;
    status: string;
    uptime: number;
    timestamp: number;
    checks: ChecksInterface[]
}