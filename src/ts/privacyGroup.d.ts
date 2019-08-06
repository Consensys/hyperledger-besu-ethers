export interface PrivacyGroupOptions {
    privateFrom?: string;
    privateFor: string[] | string;
    restriction: 'restricted' | 'unrestricted';
}
export declare function generatePrivacyGroup(privacyGroupOptions: PrivacyGroupOptions): string;
