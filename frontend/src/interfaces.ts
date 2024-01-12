export interface User {
    _id: string;
    email: string;
    profilePicture?: string;
    communityId: string;
    experiencePoints?: {points: number, timestamp: string}[];
}
  
export interface Community {
    _id: string;
    name: string;
    logo?: string;
    totalPoints?: number;
    totalMembers?: number;
}