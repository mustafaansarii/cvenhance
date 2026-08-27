package com.docservice.careerhub.util;

import org.springframework.util.StringUtils;


public final class EmailBodies {

    private EmailBodies() {
    }

    private static final String H = "margin:0 0 14px; font-size:16px; font-weight:700; color:#1f1e1d;";
    private static final String P = "margin:0 0 10px;";
    private static final String MUTED = "margin:0; color:#8a8880; font-size:13px;";
    private static final String BOX = "margin:12px 0; padding:14px 16px; background-color:#f5f4ee; border:1px solid #eae7df; border-radius:10px; white-space:pre-wrap; color:#1f1e1d;";
    private static final String BTN = "display:inline-block; margin:6px 0 4px; padding:11px 22px; background-color:#c96442; color:#ffffff; font-size:13px; font-weight:700; text-decoration:none; border-radius:8px;";

    public static String esc(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    public static String message(String heading, String message) {
        StringBuilder b = new StringBuilder();
        if (StringUtils.hasText(heading)) {
            b.append("<p style='").append(H).append("'>").append(esc(heading)).append("</p>");
        }
        b.append("<div style='margin:0; white-space:pre-wrap; color:#1f1e1d; font-size:14px; line-height:1.65;'>")
                .append(esc(message)).append("</div>");
        return b.toString();
    }

    public static String otp(String otp) {
        return "<p style='" + H + "'>Verify your email</p>"
                + "<p style='" + P + "'>Use this verification code to continue:</p>"
                + "<div style='margin:18px 0;'>"
                + "<span style='display:inline-block; background-color:#f5f4ee; border:1px solid #eae7df; border-radius:10px; padding:12px 22px; font-size:28px; font-weight:800; letter-spacing:8px; color:#c96442;'>"
                + esc(otp) + "</span></div>"
                + "<p style='" + P + "'>This code expires in <strong>5 minutes</strong>.</p>"
                + "<p style='" + MUTED + "'>If you didn't request this code, you can safely ignore this email.</p>";
    }

    public static String contact(String name, String email, String message) {
        return "<p style='" + H + "'>New contact query</p>"
                + "<p style='margin:0 0 4px;'><strong>From:</strong> " + esc(name) + "</p>"
                + "<p style='margin:0 0 14px;'><strong>Email:</strong> <a href='mailto:" + esc(email)
                + "' style='color:#c96442; text-decoration:none;'>" + esc(email) + "</a></p>"
                + "<div style='" + BOX + "'>" + esc(message) + "</div>"
                + "<p style='margin:16px 0 0; color:#8a8880; font-size:13px;'>Reply directly to this email to respond to "
                + esc(name) + ".</p>";
    }

    public static String welcome(String name) {
        String userName = StringUtils.hasText(name) ? esc(name) : "there";
        return "<p style='" + H + "'>Welcome Back to CVEnhance 🎉</p>"
                + "<p style='" + P + "'>Hi " + userName + ", thanks for joining CVEnhance — your AI-powered, ATS-friendly resume builder.</p>"
                + "<p style='" + P + "'>Pick a template, let AI help you write strong bullet points, and check your resume's ATS score in seconds.</p>"
                + "<p style='margin:16px 0;'><a href='https://cvenhance.in/templates?type=CV_AND_RESUME&page=1&size=50' style='" + BTN + "'>Build your resume →</a></p>"
                + "<p style='" + MUTED + "'>Happy job hunting!</p>";
    }

    public static String templateUnlocked(String name, String templateName) {
        String userName = StringUtils.hasText(name) ? esc(name) : "there";
        String templateCode = StringUtils.hasText(templateName) ? ("“" + esc(templateName) + "”") : "your resume";
        return "<p style='" + H + "'>Congratulations 🎉</p>"
                + "<p style='" + P + "'>Hi " + userName + ", Template: " + templateCode + " is now unlocked. You can Edit, Analyze, and download a clean, ATS friendly PDF anytime.</p>"
                + "<p style='margin:16px 0;'><a href='https://cvenhance.in/my-templates' style='" + BTN + "'>Open my resume →</a></p>"
                + "<p style='" + MUTED + "'>Tip: run it through our ATS checker before you apply.</p>";
    }

    public static String resumeAssigned(String name) {
        String userName = StringUtils.hasText(name) ? esc(name) : "there";
        return "<p style='" + H + "'>A resume has been added to your account 🎉</p>"
                + "<p style='" + P + "'>Hi " + userName + ", our team has prepared a resume and added it to your CVEnhance account.</p>"
                + "<p style='" + P + "'>Sign in to review it, make edits, analyze it, and download an ATS-friendly PDF.</p>"
                + "<p style='margin:16px 0;'><a href='https://cvenhance.in/my-templates' style='" + BTN + "'>Open my resume →</a></p>"
                + "<p style='" + MUTED + "'>If you weren't expecting this, you can safely ignore this email.</p>";
    }
}
