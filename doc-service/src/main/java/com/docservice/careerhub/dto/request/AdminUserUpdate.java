package com.docservice.careerhub.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUserUpdate {

    @NotNull(message = "id is required")
    private Long id;

    // Only non-null fields are applied. Roles are intentionally NOT editable — admins
    // cannot promote/demote other users.
    private String fullName;
    private Boolean verified;
}
