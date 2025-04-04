package net.scit.backend.schedule.repository;

import net.scit.backend.schedule.entity.MediumTagEntity;
import net.scit.backend.schedule.entity.SmallTagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmallTagRepository extends JpaRepository<SmallTagEntity, Long> {

    Optional<SmallTagEntity> findByTagName(String smallTagName);

    List<SmallTagEntity> findAllByMediumTag(MediumTagEntity mediumTagEntity);

    Optional<SmallTagEntity> findByMediumTagAndTagName(MediumTagEntity mediumTagEntity, String tagName);
}
