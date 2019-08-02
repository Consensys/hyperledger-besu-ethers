export interface PrivacyGroupOptions {
    privateFrom?: string;
    privateFor?: string[] | string;
    privacyGroupId?: string;
}
export declare function generatePrivacyGroup(privacyGroupOptions: PrivacyGroupOptions): string;
