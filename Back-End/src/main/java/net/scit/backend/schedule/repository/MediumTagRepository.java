
package net.scit.backend.schedule.repository;

import net.scit.backend.schedule.entity.LargeTagEntity;
import net.scit.backend.schedule.entity.MediumTagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediumTagRepository extends JpaRepository<MediumTagEntity, Long> {

    Optional<MediumTagEntity> findByTagName(String mediumTagName);

    List<MediumTagEntity> findAllByLargeTag(LargeTagEntity largeTagEntity);
}
