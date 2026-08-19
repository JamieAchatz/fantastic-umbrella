import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;


@Path("/api")
public class api {
    @GET
    @Path("/editor")
    @Produces(MediaType.TEXT_HTML)
    public String loginPage() throws Exception {
        try (InputStream in = getClass().getResourceAsStream("/web/texteditor.html")) {
            if (in == null) {
                throw new RuntimeException("login.html not found");
            }
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Path("/save")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response editorSave(String request){
        System.out.println(request);
        return Response.ok().build(); 
    }
    
}
