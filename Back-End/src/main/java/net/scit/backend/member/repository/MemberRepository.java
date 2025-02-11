package net.scit.backend.member.repository;

import net.scit.backend.member.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<MemberEntity, String> {
    Optional<MemberEntity> findByEmail(String email);
}
