package artistalbum.domain.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seplag.artistalbum.domain.auth.controller.AuthResource;
import com.seplag.artistalbum.domain.auth.dto.LoginRequest;
import com.seplag.artistalbum.domain.auth.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthResource.class)
class AuthResourceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtService jwtService;

    @Test
    void loginRetornaToken() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword("secret");

        UserDetails userDetails = User.withUsername("user").password("secret").authorities("USER").build();
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(auth);
        when(jwtService.generateToken(userDetails)).thenReturn("jwt-token");
        when(jwtService.extractExpiration("jwt-token"))
                .thenReturn(new Date(System.currentTimeMillis() + 60000));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").isNumber());
    }

    @Test
    void refreshRetornaNovoToken() throws Exception {
        when(jwtService.canTokenBeRefreshed("old-token")).thenReturn(true);
        when(jwtService.extractUsername("old-token")).thenReturn("user");
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("new-token");
        when(jwtService.extractExpiration("new-token"))
                .thenReturn(new Date(System.currentTimeMillis() + 120000));

        mockMvc.perform(post("/auth/refresh")
                        .header("Authorization", "Bearer old-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("new-token"))
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").isNumber());
    }

    @Test
    void refreshSemBearerRetornaBadRequest() throws Exception {
        mockMvc.perform(post("/auth/refresh"))
                .andExpect(status().isBadRequest());
    }
}
