package artistalbum.config.ratelimit;

import com.seplag.artistalbum.config.ratelimit.TaxaLimiteConfig;
import com.seplag.artistalbum.config.ratelimit.TaxaLimiteInterceptor;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class TaxaLimiteInterceptorTest {

    @Test
    void retorna429QuandoExcedeLimite() throws Exception {
        TaxaLimiteConfig config = new TaxaLimiteConfig();
        Bucket bucket = config.criarNovoBucket();
        TaxaLimiteInterceptor interceptor = new TaxaLimiteInterceptor(bucket);

        MockHttpServletRequest requisicao = new MockHttpServletRequest();

        for (int i = 0; i < 10; i++) {
            MockHttpServletResponse resposta = new MockHttpServletResponse();
            boolean permitido = interceptor.preHandle(requisicao, resposta, new Object());
            assertThat(permitido).isTrue();
            assertThat(resposta.getHeader("X-Rate-Limit-Remaining")).isNotNull();
        }

        MockHttpServletResponse respostaLimite = new MockHttpServletResponse();
        boolean permitido = interceptor.preHandle(requisicao, respostaLimite, new Object());

        assertThat(permitido).isFalse();
        assertThat(respostaLimite.getStatus()).isEqualTo(HttpServletResponse.SC_TOO_MANY_REQUESTS);
        assertThat(respostaLimite.getHeader("X-Rate-Limit-Retry-After-Seconds")).isNotNull();
    }
}
