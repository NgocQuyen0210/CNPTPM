package com.phong.it.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.phong.it.client.ProductServiceClient;
import com.phong.it.dto.AiConsultRequest;
import com.phong.it.dto.AiConsultResponse;
import com.phong.it.dto.response.ProductResponseDTO;
import com.phong.it.helper.ApiResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@ApplicationScoped
public class AiService {

    private static final Logger LOG = Logger.getLogger(AiService.class);

    @Inject
    @RestClient
    ProductServiceClient productServiceClient;

    @ConfigProperty(name = "gemini.api.key", defaultValue = "")
    String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    // Cache products to minimize inter-service calls
    private List<ProductResponseDTO> productsCache = null;
    private long lastFetchTime = 0;
    private static final long CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

    private synchronized List<ProductResponseDTO> getProductCatalog() {
        long now = System.currentTimeMillis();
        if (productsCache != null && (now - lastFetchTime < CACHE_DURATION_MS)) {
            return productsCache;
        }
        try {
            ApiResponse<List<ProductResponseDTO>> apiResponse = productServiceClient.getAllProducts();
            if (apiResponse != null && apiResponse.data() != null) {
                productsCache = apiResponse.data();
                lastFetchTime = now;
            } else {
                productsCache = Collections.emptyList();
            }
        } catch (Exception e) {
            LOG.error("Failed to load product catalog for AI service", e);
            if (productsCache == null) {
                productsCache = Collections.emptyList();
            }
        }
        return productsCache;
    }

    public AiConsultResponse consult(AiConsultRequest request) {
        List<ProductResponseDTO> catalog = getProductCatalog();
        String userMessage = request.getMessage();
        List<AiConsultRequest.ChatMessage> history = request.getHistory() != null ? request.getHistory() : Collections.emptyList();

        String activeKey = (request.getApiKey() != null && !request.getApiKey().trim().isEmpty())
                ? request.getApiKey()
                : apiKey;

        if (activeKey != null && !activeKey.trim().isEmpty() && !activeKey.equalsIgnoreCase("none")) {
            try {
                return consultWithGemini(userMessage, catalog, activeKey, history);
            } catch (Exception e) {
                LOG.warn("Failed to call Gemini API, falling back to local recommendation engine", e);
            }
        }

        return smartLocalRecommendation(userMessage, catalog);
    }

    private AiConsultResponse consultWithGemini(String userMessage, List<ProductResponseDTO> catalog, String key, List<AiConsultRequest.ChatMessage> history) throws IOException, InterruptedException {
        List<Map<String, Object>> simplifiedCatalog = catalog.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.id());
            map.put("name", p.name());
            map.put("brand", p.brand() != null ? p.brand() : "");
            map.put("price", p.price());
            map.put("category", p.categoryName() != null ? p.categoryName() : "");
            map.put("summary", p.summary() != null ? p.summary() : (p.content() != null ? p.content() : ""));
            return map;
        }).collect(Collectors.toList());

        String systemPrompt = "Bạn là Trợ lý AI Tư vấn Mua sắm chuyên nghiệp của cửa hàng Đồ Điện Tử & Phụ Kiện Công Nghệ chính hãng.\n" +
                "Shop CHỈ kinh doanh các dòng sản phẩm Đồ Điện Tử (Điện thoại/Smartphone, Laptop, Tablet, Smartwatch) và Phụ kiện công nghệ (Tai nghe, Loa, Sạc, Cáp, Bàn phím, Chuột, Ốp lưng, AirTag...).\n\n" +
                "Hãy tuân thủ các chính sách của cửa hàng khi khách hỏi:\n" +
                "1. Địa chỉ & Giờ làm việc: Cửa hàng ở trung tâm TP.HCM và Hà Nội, mở cửa 8:30 - 21:30 hàng ngày.\n" +
                "2. Bảo hành: Cam kết chính hãng 100%, bảo hành 12-24 tháng theo hãng, 1 đổi 1 trong 30 ngày đầu nếu lỗi NSX.\n" +
                "3. Giao hàng: Giao hàng toàn quốc. Nội thành nhận hàng sau 1-2 ngày, tỉnh khác 3-5 ngày. Miễn phí vận chuyển từ đơn hàng 1 triệu VNĐ.\n" +
                "4. Thanh toán: Hỗ trợ COD (khi nhận hàng), Chuyển khoản ngân hàng (Internet Banking), ví điện tử Momo, VNPay.\n" +
                "5. Đổi trả: Hỗ trợ đổi trả trong 7 ngày đối với hàng chưa sử dụng, còn nguyên hộp/tem mác.\n" +
                "6. Hủy đơn: Hủy trong mục Lịch sử mua hàng nếu chưa giao hàng. Nếu đang giao, liên hệ hotline 1900 xxxx để hỗ trợ.\n" +
                "7. Hóa đơn VAT: Hỗ trợ xuất hóa đơn VAT điện tử, khách ghi chú khi đặt hàng hoặc báo CSKH.\n" +
                "8. Khuyến mãi: Mã giảm giá ở banner trang chủ, miễn phí ship đơn từ 1 triệu.\n\n" +
                "Dưới đây là Danh sách Sản phẩm hiện có trong kho hàng của shop:\n" +
                objectMapper.writeValueAsString(simplifiedCatalog) + "\n\n" +
                "Nhiệm vụ của bạn:\n" +
                "1. Đọc và hiểu nhu cầu/yêu cầu về thiết bị điện tử & phụ kiện của khách hàng (ngân sách, tính năng camera, pin, cấu hình chơi game, mỏng nhẹ văn phòng...).\n" +
                "2. Lựa chọn các sản phẩm điện tử/phụ kiện PHÙ HỢP NHẤT từ danh sách trên để tư vấn cho khách.\n" +
                "3. Trả lời khách bằng tiếng Việt lịch sự, am hiểu công nghệ, tự nhiên. Giải thích lý do chọn sản phẩm.\n" +
                "4. Cuối phản hồi, BẮT BUỘC chèn một dòng định dạng danh sách ID sản phẩm được đề xuất chính xác theo dạng:\n" +
                "[RECOMMEND: id1, id2, id3]\n" +
                "Ví dụ: [RECOMMEND: 1, 5, 8] (nếu không có sản phẩm nào hợp, để [RECOMMEND:])";

        // Build Gemini API payload
        ObjectNode payload = objectMapper.createObjectNode();
        
        // Use systemInstruction for system prompt (avoids role alternation issues)
        ObjectNode systemInstruction = payload.putObject("systemInstruction");
        systemInstruction.putArray("parts").addObject().put("text", systemPrompt);

        ArrayNode contentsNode = payload.putArray("contents");

        // Add last 6 messages of chat history
        int startIdx = Math.max(0, history.size() - 6);
        for (int i = startIdx; i < history.size(); i++) {
            AiConsultRequest.ChatMessage msg = history.get(i);
            ObjectNode histMsg = contentsNode.addObject();
            histMsg.put("role", "user".equalsIgnoreCase(msg.getSender()) ? "user" : "model");
            histMsg.putArray("parts").addObject().put("text", msg.getText());
        }

        // Current message
        ObjectNode currentMsg = contentsNode.addObject();
        currentMsg.put("role", "user");
        currentMsg.putArray("parts").addObject().put("text", userMessage);

        String requestBody = objectMapper.writeValueAsString(payload);
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + key;

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (httpResponse.statusCode() != 200) {
            throw new IOException("Gemini API HTTP " + httpResponse.statusCode() + ": " + httpResponse.body());
        }

        JsonNode rootNode = objectMapper.readTree(httpResponse.body());
        String rawText = rootNode.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");

        // Parse [RECOMMEND: id1, id2]
        List<Long> recommendedIds = new ArrayList<>();
        String cleanText = rawText;

        Pattern recommendPattern = Pattern.compile("\\[RECOMMEND:\\s*([\\d,\\s]*)\\]", Pattern.CASE_INSENSITIVE);
        Matcher matcher = recommendPattern.matcher(rawText);
        if (matcher.find()) {
            String idsStr = matcher.group(1);
            if (idsStr != null && !idsStr.trim().isEmpty()) {
                String[] idTokens = idsStr.split(",");
                for (String token : idTokens) {
                    try {
                        recommendedIds.add(Long.parseLong(token.trim()));
                    } catch (NumberFormatException ignored) {}
                }
            }
            cleanText = matcher.replaceAll("").trim();
        }

        List<ProductResponseDTO> recommendedProducts = catalog.stream()
                .filter(p -> recommendedIds.contains(p.id()))
                .collect(Collectors.toList());

        return new AiConsultResponse(cleanText, recommendedProducts);
    }

    private String resolveTopCategory(Long categoryId, String productName) {
        if (categoryId == null) return "";
        
        // Map Điện thoại (Phones) with name exclusions for misclassified Apple products
        if (categoryId == 1 || categoryId == 4 || categoryId == 5 || 
            (categoryId >= 35 && categoryId <= 42)) {
            String lowerName = productName.toLowerCase();
            if (lowerName.contains("imac") || lowerName.contains("studio") || 
                lowerName.contains("airtag") || lowerName.contains("airpods") || 
                lowerName.contains("watch") || lowerName.contains("tag") || 
                lowerName.contains("buds") || lowerName.contains("sạc") || 
                lowerName.contains("cáp") || lowerName.contains("ốp lưng")) {
                
                if (lowerName.contains("imac") || lowerName.contains("studio")) {
                    return "laptop";
                }
                if (lowerName.contains("watch")) {
                    return "đồng hồ";
                }
                return "phụ kiện";
            }
            return "điện thoại";
        }
        
        // Map Laptop
        if (categoryId == 2 || (categoryId >= 13 && categoryId <= 21)) {
            return "laptop";
        }
        
        // Map Tablet
        if (categoryId == 11 || categoryId == 22 || categoryId == 23) {
            return "tablet";
        }
        
        // Map Smartwatch
        if (categoryId == 12 || categoryId == 24 || categoryId == 25) {
            return "đồng hồ";
        }
        
        // Map Accessories
        if (categoryId == 3 || (categoryId >= 26 && categoryId <= 34)) {
            return "phụ kiện";
        }
        
        // Name checks as fallback
        String lowerName = productName.toLowerCase();
        if (lowerName.contains("iphone") || lowerName.contains("phone") || lowerName.contains("pixel")) {
            return "điện thoại";
        }
        if (lowerName.contains("macbook") || lowerName.contains("laptop") || lowerName.contains("book")) {
            return "laptop";
        }
        if (lowerName.contains("ipad") || lowerName.contains("tablet") || lowerName.contains("tab")) {
            return "tablet";
        }
        if (lowerName.contains("watch")) {
            return "đồng hồ";
        }
        
        return "";
    }

    private AiConsultResponse smartLocalRecommendation(String userMessage, List<ProductResponseDTO> catalog) {
        if (catalog == null || catalog.isEmpty()) {
            return new AiConsultResponse(
                    "Xin lỗi quý khách, hiện tại shop chưa thể truy xuất danh mục sản phẩm. Quý khách vui lòng thử lại sau giây lát!",
                    Collections.emptyList()
            );
        }

        String lowerMsg = userMessage.toLowerCase().trim();

        // 1. FAQ / General Conversation Handling
        // Greeting / Welcome
        if (lowerMsg.matches(".*(xin chào|hello|hi|chào shop|chào bạn|chào ad|tư vấn).*") || lowerMsg.equals("chào") || lowerMsg.equals("hi") || lowerMsg.equals("hello")) {
            if (!lowerMsg.contains("điện thoại") && !lowerMsg.contains("laptop") && !lowerMsg.contains("tai nghe") && 
                !lowerMsg.contains("đồng hồ") && !lowerMsg.contains("phụ kiện") && !lowerMsg.contains("máy tính") &&
                !lowerMsg.contains("ipad") && !lowerMsg.contains("tab") && !lowerMsg.contains("quần") && !lowerMsg.contains("áo")) {
                return new AiConsultResponse(
                        "Dạ, shop xin kính chào quý khách! 👋 Shop chuyên cung cấp Đồ Điện Tử & Phụ Kiện Công Nghệ chính hãng. Shop có thể giúp gì cho bạn hôm nay ạ?",
                        Collections.emptyList()
                );
            }
        }
        
        // Store location / Hours
        if (lowerMsg.contains("ở đâu") || lowerMsg.contains("địa chỉ") || lowerMsg.contains("cửa hàng") || 
            lowerMsg.contains("dia chi") || lowerMsg.contains("address") || lowerMsg.contains("chi nhánh")) {
            return new AiConsultResponse(
                    "Dạ, cửa hàng của shop nằm tại khu vực trung tâm TP. Hồ Chí Minh và Hà Nội, mở cửa từ 8:30 đến 21:30 hàng ngày. Bạn có thể đặt hàng trực tuyến ngay trên website này để được giao tận nơi cực nhanh nhé! 🚚",
                    Collections.emptyList()
            );
        }
        
        // Warranty policy
        if (lowerMsg.contains("bảo hành") || lowerMsg.contains("bao hanh")) {
            return new AiConsultResponse(
                    "Dạ, toàn bộ sản phẩm công nghệ tại shop cam kết chính hãng 100% và bảo hành tiêu chuẩn từ 12 đến 24 tháng theo hãng. Đặc biệt, shop hỗ trợ 1 đổi 1 trong vòng 30 ngày đầu nếu phát sinh lỗi từ nhà sản xuất ạ! 🛡️",
                    Collections.emptyList()
            );
        }
        
        // Shipping / Delivery
        if (lowerMsg.contains("giao hàng") || lowerMsg.contains("ship") || lowerMsg.contains("vận chuyển") || lowerMsg.contains("bao lâu")) {
            return new AiConsultResponse(
                    "Dạ, shop hỗ trợ giao hàng nhanh toàn quốc. Các quận nội thành TP.HCM và Hà Nội nhận hàng chỉ trong 1-2 ngày, các tỉnh thành khác từ 3-5 ngày làm việc ạ. Đơn hàng từ 1 triệu sẽ được miễn phí vận chuyển nhé! 📦",
                    Collections.emptyList()
            );
        }
        
        // Contact details / Hotline
        if (lowerMsg.contains("sđt") || lowerMsg.contains("sdt") || lowerMsg.contains("liên hệ") || 
            lowerMsg.contains("hotline") || lowerMsg.contains("zalo") || lowerMsg.contains("số điện thoại")) {
            return new AiConsultResponse(
                    "Dạ, quý khách cần hỗ trợ gấp vui lòng liên hệ hotline chăm sóc khách hàng của shop: **1900 xxxx** hoặc chat trực tiếp qua Zalo/Fanpage để nhân viên hỗ trợ kịp thời nhé! 📞",
                    Collections.emptyList()
            );
        }
        
        // Thank you
        if (lowerMsg.contains("cảm ơn") || lowerMsg.contains("cám ơn") || lowerMsg.contains("thank")) {
            return new AiConsultResponse(
                    "Dạ không có gì ạ! Rất hân hạnh được phục vụ quý khách. Chúc quý khách một ngày tốt lành và lựa chọn được sản phẩm ưng ý! 😊",
                    Collections.emptyList()
            );
        }

        // Payment options
        if (lowerMsg.contains("thanh toán") || lowerMsg.contains("chuyển khoản") || lowerMsg.contains("cod") || 
            lowerMsg.contains("banking") || lowerMsg.contains("trả tiền") || lowerMsg.contains("momo") || lowerMsg.contains("vnpay")) {
            return new AiConsultResponse(
                    "Dạ, shop hỗ trợ nhiều phương thức thanh toán linh hoạt gồm: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng (Internet Banking) và thanh toán qua ví điện tử Momo, VNPay. Quý khách có thể chọn phương thức phù hợp ở bước đặt hàng nhé! 💳",
                    Collections.emptyList()
            );
        }

        // Order cancellation
        if (lowerMsg.contains("hủy đơn") || lowerMsg.contains("huy don") || lowerMsg.contains("không mua nữa") || lowerMsg.contains("huỷ đơn")) {
            return new AiConsultResponse(
                    "Dạ, quý khách có thể tự hủy đơn hàng trong mục 'Lịch sử mua hàng' của tài khoản cá nhân nếu đơn hàng chưa chuyển sang trạng thái vận chuyển. Nếu đơn hàng đã giao đi, vui lòng liên hệ Hotline **1900 xxxx** để được hỗ trợ xử lý kịp thời ạ! ❌",
                    Collections.emptyList()
            );
        }

        // Returns / Exchanges
        if (lowerMsg.contains("đổi trả") || lowerMsg.contains("doi tra") || lowerMsg.contains("trả hàng") || 
            lowerMsg.contains("hoàn tiền") || lowerMsg.contains("trả lại")) {
            return new AiConsultResponse(
                    "Dạ, shop hỗ trợ đổi trả sản phẩm trong vòng 7 ngày kể từ khi nhận hàng nếu sản phẩm còn nguyên hộp, tem mác và chưa qua sử dụng. Nếu sản phẩm phát sinh lỗi kỹ thuật của nhà sản xuất, shop hỗ trợ 1 đổi 1 miễn phí trong 30 ngày đầu tiên ạ! 🔄",
                    Collections.emptyList()
            );
        }

        // Promotion / Discount
        if (lowerMsg.contains("khuyến mãi") || lowerMsg.contains("khuyen mai") || lowerMsg.contains("giảm giá") || 
            lowerMsg.contains("giam gia") || lowerMsg.contains("voucher") || lowerMsg.contains("ưu đãi")) {
            return new AiConsultResponse(
                    "Dạ, shop luôn có các chương trình ưu đãi hấp dẫn và mã giảm giá được cập nhật ngay tại Banner trên trang chủ website. Ngoài ra, mọi đơn hàng có giá trị từ 1 triệu đồng trở lên sẽ được miễn phí vận chuyển trên toàn quốc ạ! 🎁",
                    Collections.emptyList()
            );
        }

        // Product authenticity
        if (lowerMsg.contains("chính hãng") || lowerMsg.contains("chinh hang") || lowerMsg.contains("hàng thật") || 
            lowerMsg.contains("hàng giả") || lowerMsg.contains("nhái") || lowerMsg.contains("uy tín")) {
            return new AiConsultResponse(
                    "Dạ quý khách hoàn toàn yên tâm ạ! Shop cam kết 100% sản phẩm bán ra đều là hàng chính hãng từ các thương hiệu lớn, đầy đủ hộp, phụ kiện, hóa đơn và thẻ bảo hành đi kèm. Shop cam kết đền bù 200% giá trị đơn hàng nếu phát hiện hàng giả, hàng nhái ạ! 🌟",
                    Collections.emptyList()
            );
        }

        // Order tracking / status
        if (lowerMsg.contains("kiểm tra đơn") || lowerMsg.contains("kiem tra don") || lowerMsg.contains("trạng thái đơn") || 
            lowerMsg.contains("đơn hàng của tôi") || lowerMsg.contains("đơn hàng đâu")) {
            return new AiConsultResponse(
                    "Dạ, quý khách có thể kiểm tra trạng thái đơn hàng bất cứ lúc nào bằng cách vào mục 'Đơn hàng của tôi' trong trang cá nhân trên website. Hệ thống sẽ cập nhật trạng thái đơn hàng chi tiết theo thời gian thực ạ! 📦",
                    Collections.emptyList()
            );
        }

        // Working hours
        if (lowerMsg.contains("giờ mở cửa") || lowerMsg.contains("giờ làm việc") || lowerMsg.contains("mấy giờ") || 
            lowerMsg.contains("mở cửa lúc")) {
            return new AiConsultResponse(
                    "Dạ, cửa hàng của shop mở cửa đón khách từ 8:30 đến 21:30 tất cả các ngày trong tuần (bao gồm cả Thứ 7 và Chủ Nhật). Kênh đặt hàng trực tuyến trên website luôn hoạt động 24/7 để phục vụ quý khách ạ! ⏰",
                    Collections.emptyList()
            );
        }

        // VAT Invoice
        if (lowerMsg.contains("hóa đơn đỏ") || lowerMsg.contains("vat") || lowerMsg.contains("hóa đơn vat") || 
            lowerMsg.contains("xuất hóa đơn")) {
            return new AiConsultResponse(
                    "Dạ, shop hỗ trợ xuất hóa đơn VAT (GTGT) điện tử cho cả khách hàng cá nhân và doanh nghiệp. Quý khách vui lòng điền thông tin xuất hóa đơn (Tên công ty, Mã số thuế, Địa chỉ) ở phần ghi chú khi đặt hàng hoặc báo CSKH ngay sau khi đặt hàng nhé! 🧾",
                    Collections.emptyList()
            );
        }

        Double maxPrice = null;
        Double minPrice = null;

        // Parse maximum price (e.g. "dưới 10 triệu", "duoi 15tr")
        Pattern underPattern = Pattern.compile("(dưới|nhỏ hơn|thấp hơn|<|duoi)\\s*(\\d+(\\.\\d+)?)\\s*(tr|triệu|trieu|trk|t)", Pattern.CASE_INSENSITIVE);
        Matcher underMatcher = underPattern.matcher(lowerMsg);
        if (underMatcher.find()) {
            maxPrice = Double.parseDouble(underMatcher.group(2)) * 1000000.0;
        }

        // Parse minimum price (e.g. "trên 15 triệu", "tren 5tr")
        Pattern overPattern = Pattern.compile("(trên|lớn hơn|cao hơn|>|tren)\\s*(\\d+(\\.\\d+)?)\\s*(tr|triệu|trieu|trk|t)", Pattern.CASE_INSENSITIVE);
        Matcher overMatcher = overPattern.matcher(lowerMsg);
        if (overMatcher.find()) {
            minPrice = Double.parseDouble(overMatcher.group(2)) * 1000000.0;
        }

        // Parse approximate price (e.g. "tầm 15 triệu", "khoảng 20tr")
        Pattern approxPattern = Pattern.compile("(tầm|khoảng|tam|khoang|xung quanh)\\s*(\\d+(\\.\\d+)?)\\s*(tr|triệu|trieu|trk|t)", Pattern.CASE_INSENSITIVE);
        Matcher approxMatcher = approxPattern.matcher(lowerMsg);
        if (approxMatcher.find() && maxPrice == null && minPrice == null) {
            double basePrice = Double.parseDouble(approxMatcher.group(2)) * 1000000.0;
            minPrice = basePrice * 0.7;
            maxPrice = basePrice * 1.3;
        }

        // Brands match
        List<String> knownBrands = Arrays.asList("apple", "iphone", "samsung", "dell", "asus", "lenovo", "hp", "acer", "msi", "sony", "xiaomi", "oppo");
        List<String> matchedBrands = knownBrands.stream().filter(lowerMsg::contains).collect(Collectors.toList());

        // Category matching check
        String requestedCategory = "";
        if (lowerMsg.contains("điện thoại") || lowerMsg.contains("phone") || lowerMsg.contains("iphone") || lowerMsg.contains("smartphone") || lowerMsg.contains("đt")) {
            requestedCategory = "điện thoại";
        } else if (lowerMsg.contains("laptop") || lowerMsg.contains("máy tính xách tay") || lowerMsg.contains("may tinh") || lowerMsg.contains("macbook")) {
            requestedCategory = "laptop";
        } else if (lowerMsg.contains("tablet") || lowerMsg.contains("máy tính bảng") || lowerMsg.contains("ipad") || lowerMsg.contains("tab")) {
            requestedCategory = "tablet";
        } else if (lowerMsg.contains("đồng hồ") || lowerMsg.contains("watch") || lowerMsg.contains("smartwatch")) {
            requestedCategory = "đồng hồ";
        } else if (lowerMsg.contains("tai nghe") || lowerMsg.contains("phụ kiện") || lowerMsg.contains("sạc") || lowerMsg.contains("cáp") || lowerMsg.contains("chuột") || lowerMsg.contains("bàn phím")) {
            requestedCategory = "phụ kiện";
        } else if (lowerMsg.contains("áo") || lowerMsg.contains("quần") || lowerMsg.contains("váy") || lowerMsg.contains("đầm") || lowerMsg.contains("thời trang")) {
            requestedCategory = "thời trang";
        }

        // Category keywords mapping (legacy fallback)
        Map<String, List<String>> categoryKeywords = new HashMap<>();
        categoryKeywords.put("điện thoại", Arrays.asList("điện thoại", "phone", "iphone", "smartphone", "di dien thoai", "đt"));
        categoryKeywords.put("laptop", Arrays.asList("laptop", "máy tính xách tay", "may tinh", "macbook", "pc"));
        categoryKeywords.put("tai nghe", Arrays.asList("tai nghe", "headphone", "earphone", "airpods"));
        categoryKeywords.put("đồng hồ", Arrays.asList("đồng hồ", "watch", "smartwatch"));

        // Intent keywords mapping
        Map<String, List<String>> intentKeywords = new HashMap<>();
        intentKeywords.put("gaming", Arrays.asList("game", "chơi game", "gaming", "đồ họa", "cấu hình mạnh"));
        intentKeywords.put("office", Arrays.asList("văn phòng", "học tập", "sinh viên", "mỏng nhẹ", "gọn nhẹ", "làm việc"));
        intentKeywords.put("camera", Arrays.asList("chụp ảnh", "chụp hình", "camera", "quay video", "sống ảo"));
        intentKeywords.put("battery", Arrays.asList("pin trâu", "pin khỏe", "dung lượng pin"));
        intentKeywords.put("cheap", Arrays.asList("giá rẻ", "rẻ", "tiết kiệm", "bình dân"));
        intentKeywords.put("best", Arrays.asList("nổi bật", "bán chạy", "mới nhất", "tốt nhất", "xịn nhất", "cao cấp"));

        class ScoredProduct {
            final ProductResponseDTO product;
            int score;

            ScoredProduct(ProductResponseDTO product, int score) {
                this.product = product;
                this.score = score;
            }
        }

        List<ScoredProduct> scoredProducts = new ArrayList<>();

        for (ProductResponseDTO p : catalog) {
            int score = 0;
            String pName = p.name() != null ? p.name().toLowerCase() : "";
            String pBrand = p.brand() != null ? p.brand().toLowerCase() : "";
            String pCategory = p.categoryName() != null ? p.categoryName().toLowerCase() : "";
            String pSummary = (p.summary() != null ? p.summary().toLowerCase() : "") + " " +
                    (p.content() != null ? p.content().toLowerCase() : "");
            double pPrice = p.price() != null ? p.price().doubleValue() : 0.0;

            // Price filtering
            if (maxPrice != null && pPrice > maxPrice) continue;
            if (minPrice != null && pPrice < minPrice) continue;
            if (maxPrice != null || minPrice != null) score += 20;

            // Big Category matching boost or penalty
            if (!requestedCategory.isEmpty()) {
                String topCat = resolveTopCategory(p.categoryId(), p.name());
                if (topCat.equals(requestedCategory)) {
                    score += 200; // Large boost for matching target category
                } else {
                    score -= 100; // Penalty for other categories
                }
            }

            // Brand matching
            for (String brand : matchedBrands) {
                if (pBrand.contains(brand) || pName.contains(brand)) {
                    score += 40;
                }
            }

            // Word matching
            String[] words = lowerMsg.split("\\s+");
            for (String w : words) {
                if (w.length() > 2) {
                    if (pName.contains(w)) score += 15;
                    if (pSummary.contains(w)) score += 5;
                }
            }

            // Legacy Category matching fallback
            for (Map.Entry<String, List<String>> entry : categoryKeywords.entrySet()) {
                String catName = entry.getKey();
                List<String> keys = entry.getValue();
                boolean keysMatch = keys.stream().anyMatch(lowerMsg::contains);
                if (keysMatch) {
                    if (pCategory.contains(catName) || pName.contains(catName)) {
                        score += 35;
                    }
                }
            }

            // Intent matching
            for (Map.Entry<String, List<String>> entry : intentKeywords.entrySet()) {
                String intent = entry.getKey();
                List<String> keys = entry.getValue();
                boolean keysMatch = keys.stream().anyMatch(lowerMsg::contains);
                if (keysMatch) {
                    if (pSummary.contains(intent) || pName.contains(intent) || keys.stream().anyMatch(pSummary::contains) || keys.stream().anyMatch(pName::contains)) {
                        score += 25;
                    }
                }
            }

            // Custom target intent boosts (matching specific flagship specs)
            if (lowerMsg.contains("chụp ảnh") || lowerMsg.contains("camera") || lowerMsg.contains("chụp hình") || lowerMsg.contains("quay phim") || lowerMsg.contains("sống ảo")) {
                if (pName.contains("pro max") || pName.contains("ultra") || pName.contains("xperia") || pName.contains("pro")) {
                    score += 60; // Extra boost for flagship cameras!
                }
            }
            if (lowerMsg.contains("chơi game") || lowerMsg.contains("game") || lowerMsg.contains("gaming") || lowerMsg.contains("cấu hình mạnh") || lowerMsg.contains("mạnh nhất")) {
                if (pName.contains("gaming") || pName.contains("ultra") || pName.contains("max") || pName.contains("pro") || pName.contains("msi") || pName.contains("rog")) {
                    score += 60; // Extra boost for gaming hardware!
                }
            }
            if (lowerMsg.contains("học tập") || lowerMsg.contains("văn phòng") || lowerMsg.contains("sinh viên") || lowerMsg.contains("mỏng nhẹ") || lowerMsg.contains("gọn nhẹ") || lowerMsg.contains("làm việc")) {
                if (pName.contains("air") || pName.contains("slim") || pName.contains("light") || pName.contains("book") || pName.contains("a55") || pName.contains("watch")) {
                    score += 50; // Extra boost for office/portable devices!
                }
            }
            if (lowerMsg.contains("giá rẻ") || lowerMsg.contains("rẻ") || lowerMsg.contains("tiết kiệm") || lowerMsg.contains("bình dân") || lowerMsg.contains("học sinh")) {
                if (pPrice < 5000000.0) {
                    score += 80;
                } else if (pPrice < 15000000.0) {
                    score += 40;
                }
            }
            if (lowerMsg.contains("mới nhất") || lowerMsg.contains("bán chạy") || lowerMsg.contains("hot") || lowerMsg.contains("tốt nhất") || lowerMsg.contains("nên mua")) {
                if (pName.contains("15 pro") || pName.contains("s24") || pName.contains("m3") || pName.contains("buds 2 pro") || pName.contains("watch 6")) {
                    score += 50;
                }
            }

            scoredProducts.add(new ScoredProduct(p, score));
        }

        // Sort by score descending
        List<ProductResponseDTO> topProducts = scoredProducts.stream()
                .filter(item -> item.score > 0)
                .sorted((a, b) -> Integer.compare(b.score, a.score))
                .limit(4)
                .map(item -> item.product)
                .collect(Collectors.toList());

        // Fallback to random 3 products if nothing matched
        if (topProducts.isEmpty()) {
            List<ProductResponseDTO> shuffleCatalog = new ArrayList<>(catalog);
            Collections.shuffle(shuffleCatalog);
            topProducts = shuffleCatalog.stream().limit(3).collect(Collectors.toList());
        }

        // Create natural conversational advice
        String adviceText = "Dựa trên yêu cầu của bạn, shop xin gợi ý các sản phẩm phù hợp nhất dưới đây:\n";

        if (maxPrice != null) {
            adviceText = String.format("Dạ, với mức ngân sách khoảng dưới **%,.0f triệu VNĐ**, shop khuyên bạn nên tham khảo các dòng sản phẩm chất lượng cao sau:\n", maxPrice / 1000000.0);
        } else if (!matchedBrands.isEmpty()) {
            String brandStr = matchedBrands.stream().map(String::toUpperCase).collect(Collectors.joining(", "));
            adviceText = String.format("Shop xin gợi ý các sản phẩm thuộc thương hiệu **%s** được ưa chuộng nhất hiện nay:\n", brandStr);
        } else if ("điện thoại".equals(requestedCategory)) {
            adviceText = "Dạ, shop gửi bạn tham khảo các mẫu điện thoại/smartphone chính hãng, cấu hình mạnh mẽ và thiết kế thời thượng nhất đang có sẵn hàng tại shop:\n";
        } else if ("laptop".equals(requestedCategory)) {
            adviceText = "Dạ, đây là những mẫu laptop học tập, văn phòng mỏng nhẹ và laptop gaming cấu hình cao cực tốt dành cho bạn:\n";
        } else if ("đồng hồ".equals(requestedCategory)) {
            adviceText = "Dạ, shop gửi bạn các mẫu đồng hồ thông minh theo dõi sức khỏe và hỗ trợ tập luyện thể thao bán chạy nhất:\n";
        } else if ("phụ kiện".equals(requestedCategory)) {
            adviceText = "Dạ, shop có sẵn các loại phụ kiện cao cấp như tai nghe chống ồn, chuột, bàn phím cơ, sạc cáp chính hãng sau:\n";
        } else if ("thời trang".equals(requestedCategory)) {
            adviceText = "Dạ, đây là những mẫu quần áo, váy đầm thời trang nam nữ chất liệu cao cấp và kiểu dáng hot trend gửi bạn:\n";
        } else if (lowerMsg.contains("game") || lowerMsg.contains("gaming")) {
            adviceText = "Dành cho nhu cầu chơi game & giải trí hiệu năng cao, đây là những sản phẩm có cấu hình cực tốt trong tầm giá:\n";
        } else if (lowerMsg.contains("văn phòng") || lowerMsg.contains("học tập") || lowerMsg.contains("mỏng nhẹ")) {
            adviceText = "Với nhu cầu học tập, làm việc văn phòng mỏng nhẹ và thiết kế tinh tế, bạn không nên bỏ qua các lựa chọn sau:\n";
        }

        adviceText += "\n👉 *Bạn có thể bấm trực tiếp vào sản phẩm bên dưới để xem chi tiết hoặc thêm nhanh vào giỏ hàng nhé!*";

        return new AiConsultResponse(adviceText, topProducts);
    }
}
