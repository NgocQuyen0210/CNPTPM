package com.phong.it.resource;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phong.it.helper.ApiResponse;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.security.PermitAll;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Path("/api/v1/users/contacts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class ContactResource {

    private static final Logger LOG = Logger.getLogger(ContactResource.class);
    private static final String FILE_PATH = "contacts.json";
    
    private final List<ContactMessage> messages = new CopyOnWriteArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(1);
    private final AtomicLong replyIdGenerator = new AtomicLong(1);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class AdminReply {
        public Long id;
        public String message;
        public String createdAt;
    }

    public static class ContactMessage {
        public Long id;
        public String name;
        public String email;
        public String subject;
        public String message;
        public List<AdminReply> replies = new ArrayList<>();
        public String status; // "PENDING", "REPLIED"
        public String createdAt;
    }

    public static class ReplyRequest {
        public String replyMessage;
    }

    @PostConstruct
    void init() {
        loadMessagesFromFile();
    }

    private synchronized void loadMessagesFromFile() {
        File file = new File(FILE_PATH);
        if (file.exists()) {
            try {
                List<ContactMessage> loaded = objectMapper.readValue(file, new TypeReference<List<ContactMessage>>() {});
                messages.clear();
                messages.addAll(loaded);
                
                long maxId = 0;
                long maxReplyId = 0;
                for (ContactMessage msg : loaded) {
                    if (msg.id != null && msg.id > maxId) {
                        maxId = msg.id;
                    }
                    if (msg.replies != null) {
                        for (AdminReply rep : msg.replies) {
                            if (rep.id != null && rep.id > maxReplyId) {
                                maxReplyId = rep.id;
                            }
                        }
                    }
                }
                idGenerator.set(maxId + 1);
                replyIdGenerator.set(maxReplyId + 1);
                LOG.infof("Loaded %d contact messages from %s", messages.size(), FILE_PATH);
            } catch (IOException e) {
                LOG.error("Failed to load contact messages", e);
            }
        } else {
            seedDummyMessages();
            saveMessagesToFile();
        }
    }

    private synchronized void saveMessagesToFile() {
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(FILE_PATH), new ArrayList<>(messages));
        } catch (IOException e) {
            LOG.error("Failed to save contact messages", e);
        }
    }

    private void seedDummyMessages() {
        ContactMessage msg1 = new ContactMessage();
        msg1.id = idGenerator.getAndIncrement();
        msg1.name = "Nguyễn Văn A";
        msg1.email = "vana@gmail.com";
        msg1.subject = "Hỏi về chế độ bảo hành";
        msg1.message = "Chào shop, điện thoại iPhone 15 mua tại shop có được bảo hành 1 đổi 1 trong 30 ngày không ạ?";
        msg1.status = "PENDING";
        msg1.createdAt = LocalDateTime.now().minusHours(5).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        messages.add(msg1);

        ContactMessage msg2 = new ContactMessage();
        msg2.id = idGenerator.getAndIncrement();
        msg2.name = "Trần Thị B";
        msg2.email = "thib@gmail.com";
        msg2.subject = "Giao hàng về Đồng Nai";
        msg2.message = "Shop ơi, em muốn đặt mua tai nghe ship về Đồng Nai thì mất khoảng mấy ngày nhận được hàng?";
        msg2.status = "REPLIED";
        
        AdminReply rep = new AdminReply();
        rep.id = replyIdGenerator.getAndIncrement();
        rep.message = "Dạ chào bạn, giao hàng về Đồng Nai mất khoảng 2-3 ngày làm việc ạ. Phí ship là 30k và miễn phí ship cho đơn từ 1 triệu đồng nhé!";
        rep.createdAt = LocalDateTime.now().minusDays(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        msg2.replies.add(rep);
        
        msg2.createdAt = LocalDateTime.now().minusDays(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        messages.add(msg2);
    }

    @POST
    @PermitAll
    public Response createContact(ContactMessage request) {
        if (request.name == null || request.email == null || request.message == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.success(null, "Họ tên, email và nội dung không được trống"))
                    .build();
        }

        request.id = idGenerator.getAndIncrement();
        request.status = "PENDING";
        request.createdAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        request.replies = new ArrayList<>();

        messages.add(request);
        saveMessagesToFile();

        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success(request, "Gửi tin nhắn liên hệ thành công"))
                .build();
    }

    @GET
    @PermitAll
    public Response getAllContacts() {
        List<ContactMessage> sorted = new ArrayList<>(messages);
        sorted.sort((a, b) -> b.createdAt.compareTo(a.createdAt));
        return Response.ok(ApiResponse.success(sorted)).build();
    }

    @PUT
    @Path("/{id}/reply")
    @PermitAll
    public Response replyContact(@PathParam("id") Long id, ReplyRequest request) {
        if (request == null || request.replyMessage == null || request.replyMessage.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.success(null, "Nội dung trả lời không được để trống"))
                    .build();
        }

        ContactMessage target = null;
        for (ContactMessage msg : messages) {
            if (msg.id.equals(id)) {
                target = msg;
                break;
            }
        }

        if (target == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.success(null, "Không tìm thấy tin nhắn liên hệ"))
                    .build();
        }

        if (target.replies == null) {
            target.replies = new ArrayList<>();
        }

        AdminReply newReply = new AdminReply();
        newReply.id = replyIdGenerator.getAndIncrement();
        newReply.message = request.replyMessage;
        newReply.createdAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        target.replies.add(newReply);
        target.status = "REPLIED";
        saveMessagesToFile();

        return Response.ok(ApiResponse.success(target, "Trả lời tin nhắn thành công")).build();
    }

    @PUT
    @Path("/{messageId}/reply/{replyId}")
    @PermitAll
    public Response updateReply(@PathParam("messageId") Long messageId, @PathParam("replyId") Long replyId, ReplyRequest request) {
        if (request == null || request.replyMessage == null || request.replyMessage.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.success(null, "Nội dung trả lời không được để trống"))
                    .build();
        }

        ContactMessage target = null;
        for (ContactMessage msg : messages) {
            if (msg.id.equals(messageId)) {
                target = msg;
                break;
            }
        }

        if (target == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.success(null, "Không tìm thấy tin nhắn liên hệ"))
                    .build();
        }

        if (target.replies != null) {
            for (AdminReply rep : target.replies) {
                if (rep.id.equals(replyId)) {
                    rep.message = request.replyMessage;
                    rep.createdAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + " (Đã chỉnh sửa)";
                    saveMessagesToFile();
                    return Response.ok(ApiResponse.success(target, "Cập nhật phản hồi thành công")).build();
                }
            }
        }

        return Response.status(Response.Status.NOT_FOUND)
                .entity(ApiResponse.success(null, "Không tìm thấy phản hồi cần sửa"))
                .build();
    }

    @DELETE
    @Path("/{messageId}/reply/{replyId}")
    @PermitAll
    public Response deleteReply(@PathParam("messageId") Long messageId, @PathParam("replyId") Long replyId) {
        ContactMessage target = null;
        for (ContactMessage msg : messages) {
            if (msg.id.equals(messageId)) {
                target = msg;
                break;
            }
        }

        if (target == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.success(null, "Không tìm thấy tin nhắn liên hệ"))
                    .build();
        }

        if (target.replies != null) {
            boolean removed = target.replies.removeIf(rep -> rep.id.equals(replyId));
            if (removed) {
                if (target.replies.isEmpty()) {
                    target.status = "PENDING";
                }
                saveMessagesToFile();
                return Response.ok(ApiResponse.success(target, "Xóa phản hồi thành công")).build();
            }
        }

        return Response.status(Response.Status.NOT_FOUND)
                .entity(ApiResponse.success(null, "Không tìm thấy phản hồi cần xóa"))
                .build();
    }
}
