package net.scit.backend.oauth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GoogleDTO {

    private String iss;
    private String azp;
    private String aud;
    private String sub;
    private String email;
    private boolean emailVerified;
    private long nbf;
    private String name;
    private String picture;
    private String givenName;
    private String familyName;
    private long iat;
    private long exp;
    private String jti;
}
