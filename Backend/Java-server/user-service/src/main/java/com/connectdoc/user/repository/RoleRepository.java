package com.connectdoc.user.repository;

import com.connectdoc.user.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByRoleName(String roleName);
    Optional<Role> findByRoleNameIgnoreCase(String roleName);
}
