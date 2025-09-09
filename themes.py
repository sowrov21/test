def get_theme_config(theme_name):
    """Return theme configuration based on theme name"""
    themes = {
        "light": {
            "primaryColor": "#4b8bff",
            "backgroundColor": "#ffffff",
            "secondaryBackgroundColor": "#f0f2f6",
            "textColor": "#31333f",
            "font": "sans serif"
        },
        "dark": {
            "primaryColor": "#4b8bff",
            "backgroundColor": "#0e1117",
            "secondaryBackgroundColor": "#1a1d24",
            "textColor": "#f0f2f6",
            "font": "sans serif"
        },
        "corporate": {
            "primaryColor": "#1a3e72",
            "backgroundColor": "#f8f9fa",
            "secondaryBackgroundColor": "#e9ecef",
            "textColor": "#212529",
            "font": "sans serif"
        }
    }
    
    return themes.get(theme_name, themes["light"])