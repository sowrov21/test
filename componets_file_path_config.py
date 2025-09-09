import config
env = config.APP_ENV

if env == "dev":
    data_management_component_path = "custom_components/data-management/dist-dev"
    label_management_component_path = "custom_components/label-management/publicDev"
    operation_management_component_path = "custom_components/operation-management/dist-dev"
    upload_management_component_path = "custom_components/upload-management/dist-dev"
else:  # prod
    data_management_component_path = "custom_components/data-management/dist"
    label_management_component_path = "custom_components/label-management/dist"
    operation_management_component_path = "custom_components/operation-management/dist"
    upload_management_component_path = "custom_components/upload-management/dist"
