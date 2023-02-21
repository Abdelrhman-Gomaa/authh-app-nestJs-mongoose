export type OptsType = {
    fileName?: string;
    template?: string;
    data?: Record<string, unknown>;
    text?: string;
};

export type MailDetails = {
    from?: string;
    to: string;
    subject?: string;
    text?: string;
};  