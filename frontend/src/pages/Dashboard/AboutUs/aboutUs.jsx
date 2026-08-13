import React, { useEffect } from "react";
import { FaBullseye, FaEye, FaUsers, FaLeaf } from "react-icons/fa";
import phongImg from "../../../assets/image/Screenshot 2026-05-14 222511.png";
import datImg from "../../../assets/image/dat.png";
import duyenImg from "../../../assets/image/duyen.png";
import "./aboutUs.css";

function AboutUs() {
  // Test gọi API từ Backend E-Commerce-Quarkus
  useEffect(() => {
    fetch("http://localhost:9000/api/v1/products")
      .then((res) => res.json())
      .then((data) => {
        console.log("Dữ liệu danh sách sản phẩm lấy từ Backend Quarkus:", data);
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API Backend:", error);
      });
  }, []);

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content">
          <h1>Về Chúng Tôi</h1>
          <p>
            Chúng tôi tự hào mang đến những sản phẩm chất lượng cao, kết hợp giữa
            thiết kế hiện đại và trải nghiệm người dùng tuyệt vời.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="about-story-section">
        <div className="about-container">
          <div className="story-grid">
            <div className="story-content">
              <h2>Câu chuyện của chúng tôi</h2>
              <p>
                Bắt đầu từ một dự án nhỏ tại Đại học Công Nghiệp Hà Nội, cửa hàng
                được thành lập bởi những con người đam mê công nghệ và yêu thích
                sự sáng tạo. Chúng tôi nhận ra rằng mua sắm trực tuyến không chỉ
                là việc tìm kiếm sản phẩm, mà còn là một trải nghiệm tuyệt vời,
                nơi khách hàng có thể khám phá phong cách và cá tính của riêng
                mình.
              </p>
              <p>
                Trải qua nhiều thử thách, chúng tôi không ngừng cải thiện và
                phát triển nền tảng của mình. Từ việc lựa chọn những nhà cung
                cấp uy tín đến việc tối ưu hóa giao diện để đem lại sự tiện lợi
                cao nhất.
              </p>
            </div>
            <div className="story-image">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Đội ngũ làm việc"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="about-values-section">
        <div className="about-container">
          <h2 className="section-title">Giá trị cốt lõi</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <FaBullseye />
              </div>
              <h3>Sứ mệnh</h3>
              <p>
                Mang đến những sản phẩm tốt nhất với giá trị thực nhất cho khách
                hàng. Đơn giản hóa quá trình mua sắm trực tuyến.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaEye />
              </div>
              <h3>Tầm nhìn</h3>
              <p>
                Trở thành nền tảng mua sắm trực tuyến hàng đầu được người tiêu
                dùng tin tưởng và lựa chọn mỗi ngày.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaUsers />
              </div>
              <h3>Khách hàng là trung tâm</h3>
              <p>
                Mọi quyết định đều lấy trải nghiệm và sự hài lòng của khách hàng
                làm kim chỉ nam để phát triển.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <FaLeaf />
              </div>
              <h3>Bền vững</h3>
              <p>
                Cam kết cung cấp các sản phẩm thân thiện với môi trường và đóng
                góp tích cực cho cộng đồng xã hội.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="about-team-section">
        <div className="about-container">
          <h2 className="section-title">Đội ngũ của chúng tôi</h2>
          <div className="team-grid">
            {/* Team Member 1 */}
            <div className="team-card">
              <img
                src={phongImg}
                alt="Thành viên 1"
              />
              <h3>Trương Văn Phong</h3>
              <p>Backend Developer</p>
            </div>
            {/* Team Member 2 */}
            <div className="team-card">
              <img
                src={datImg}
                alt="Thành viên 2"
              />
              <h3>Nguyễn Thành Đạt</h3>
              <p>Frontend Developer, UI/UX Designer</p>
            </div>
            {/* Team Member 3 */}
            <div className="team-card">
              <img
                src={duyenImg}
                alt="Thành viên 3"
              />
              <h3>Nguyễn Mỹ Duyên</h3>
              <p>Document</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
