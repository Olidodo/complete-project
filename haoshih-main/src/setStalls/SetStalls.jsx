import ChatBtn from "../components/ChatBtn";
import Footer from "../components/Footer";
import MainBg from "../components/MainBg";
import NavBarShop from "../components/NavBarShop";
import ThirdTitle from "../components/ThirdTitle";
import MarketFloorPlanB from "../components/MarketFloorPlanB";
import styles from "./setStalls.module.scss";
import Swal from "sweetalert2";
import React, { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";


const SetStalls = () => {
  const [selectedVendors, setSelectedVendors] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("4");
  const [season, setSeason] = useState(4);
  const [season_data, setSeasonData] = useState([]);
  const [rentTimePeriod, setrentTimePeriod] = useState("2024/10-2024/12")
  const user = JSON.parse(localStorage.getItem("user"));
  const rentDays = selectedPeriod === "1" ? 65 : 62;
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 3);
  const formattedDueDate = `${dueDate.getFullYear()}/${String(dueDate.getMonth() + 1).padStart(2, '0')}/${String(dueDate.getDate()).padStart(2, '0')}下午03:00`;
  const handleSelectedChange = (event) => {
    setrentTimePeriod(event.target.options[event.target.selectedIndex].innerText);
    setSelectedPeriod(event.target.value);
    setSeason(event.target.value);
    //切換季度時先清空已選的攤位
    setSelectedVendors('');
  }
  const handleSelectedVendor = (vendors) => {
    setSelectedVendors(vendors);
  }
  const submitRentInfo = async (season, selectedVendors, user) => {
    if (selectedVendors.length <= 0) {
      Swal.fire({
        icon: "warning",
        title: "尚未選擇任何攤位",
      });
      return;
    }
    console.log(selectedVendors);
    //分解為區域+號碼
    const splitVendorNumber = selectedVendors.split('0');
    //區域
    const postion = splitVendorNumber[0];
    //號碼
    const number = splitVendorNumber[1];
    //租用的攤主帳號
    const vinfo = user.vid
    console.log(selectedVendors);

    const rentInfo = { postion, number, season, vinfo };

    //確保所有必填欄位都有值
    try {
      const response = await fetch('http://localhost:3200/Map/rentvendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rentInfo),
      });
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      const result = await response.json();
      console.log('Success:', result);
    }
    catch (error) {
      console.error('Error:', error);
    }
    //定義sweetalert2視窗內容
    Swal.fire({
      title: '租用明細',
      html: `
      <div id="rent-details" style="text-align: left; font-weight: bold;">
    <h3 style="text-align: center">歡迎您加入好ㄕˋ集!</h3> <br>
    請於${formattedDueDate}前，將攤位租金全額匯款至以下帳戶(請勿扣除手續費)，<span style="color: red; font-weight: 550;">逾時攤位將自動釋出。</span><br><br>
    收款銀行：國泰世華(013)公益分行(232)<br>
    收款戶名：好市集股份有限公司<br>
    收款帳號：9876-5432-1024<br>
    <span style="color: red; font-weight: 550;">匯款後請來電 04-1234-4321 告知，謝謝您。</span><br><br>
      <div style="text-align: left; line-height: 1.7; display: flex; justify-content: center;">
        租用季度： ${rentTimePeriod}<br>
        攤位編號： ${selectedVendors}<br>
        攤位價格： ${vendorsPrice[selectedVendors]}元/天<br>
        租用天數： ${rentDays}天(周一周二休市)<br>
        總計金額： ${(vendorsPrice[selectedVendors] ? vendorsPrice[selectedVendors] * rentDays : 0).toLocaleString() || ""} 元
      </div>
    </div>
    <div id="screenshot-container" style="margin-top: 20px; padding: 10px;"></div> <!-- 這裡是用來顯示截圖的區域 -->
        `,
      confirmButtonText: '確定',
      confirmButtonColor: '#96dbc9',
      showDenyButton: true,  // 顯示另一個按鈕
      denyButtonColor: '#a6cee6',
      denyButtonText: '點選下載明細截圖',
      didOpen: async () => {
        // 確保視窗打開後進行截圖
        const printScreen = document.getElementById('rent-details');
        const container = document.getElementById('screenshot-container');
        if (printScreen && container) {
          try {
            const canvas = await html2canvas(printScreen);
            const imgData = canvas.toDataURL('image/png');
            // 檢查生成的圖片數據 URL
            console.log('Generated Image Data URL:', imgData);
            // 設定下載按鈕的 click 事件
            const downloadButton = Swal.getDenyButton();
            if (downloadButton) {
              downloadButton.addEventListener('click', (event) => {
                event.preventDefault();  //避免DenyButton防止自斷關閉對話框
                const link = document.createElement('a');
                link.href = imgData;
                link.download = '租用明細截圖.png';  // 設定下載檔名
                link.click();
                window.location.reload();
              });
            }
          } catch (error) {
            console.error('截圖失敗:', error);
          }
        } else {
          console.error('找不到元素');
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        //點擊確定按鈕後重新載入畫面
        window.location.reload();
      }
    });
  }
  useEffect(() => {
    const getSeasonData = async () => {
      try {
        const response = await axios.get(`http://localhost:3200/map/seasondata/${season}`,
        );
        setSeasonData(response.data.season_data.map(item => `${item.postion}0${item.number}`))
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    getSeasonData();
  }, [season])

  console.log(season); //租用季節
  console.log(selectedVendors); //租用攤位，需要拆解成postion、number
  console.log(user.vid); //租用攤主

  const cartVisible = 1;
  //攤位價目表
  const vendorsPrice = {
    'A01': 800,
    'A02': 800,
    'B01': 800,
    'B02': 800,
    'C01': 800,
    'C02': 800,
    'D01': 800,
    'D02': 800,
    'A03': 600,
    'A04': 600,
    'A05': 600,
    'B03': 600,
    'B04': 600,
    'B05': 600,
    'C03': 600,
    'C04': 600,
    'C05': 600,
    'D03': 600,
    'D04': 600,
    'D05': 600
  }

  return (
    <div>
      <NavBarShop cartVisible={cartVisible} />
      <MainBg title="我要擺攤" page="setStalls" />
      <Container fluid className="mt-4 bg-white p-5">
        <Row className="d-flex h-100">
          <div className="flex-1 border pt-5 pb-3 pe-0 ps-5">
            <Col>
              <ThirdTitle title="市集平面圖" />
            </Col>
            <MarketFloorPlanB
              className="flex-1"
              fetchData={handleSelectedVendor}
              selectedPeriod={selectedPeriod}
              season_data={season_data}
            ></MarketFloorPlanB>
          </div>
          <Col md={6} className="d-flex flex-1">
            <div className="border p-5" style={{ width: "100%" }}>
              <ThirdTitle title="攤位租金" />
              <div className="d-flex justify-content-evenly mt-3">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-red me-2"
                    style={{ width: "20px", height: "20px" }}
                  ></div>
                  <span>800元/天</span>
                </div>
                <div className="d-flex align-items-center">
                  <div
                    className="bg-secondary me-2"
                    style={{ width: "20px", height: "20px" }}
                  ></div>
                  <span>600元/天</span>
                </div>
              </div>
              <hr />
              <div className="d-flex mt-5 mb-2" style={{ fontSize: "20px" }}>
                <div className="f-start flex-1">
                  <span className="d-flex" style={{ fontSize: "20px" }}>
                    選擇季度：
                  </span>
                  <select
                    className="form-select d-flex flex-1 "
                    style={{ maxWidth: "200px" }}
                    value={selectedPeriod}
                    onChange={handleSelectedChange}
                  >
                    <option value="4">2024/10-2024/12</option>
                    <option value="1">2025/1-2025/3</option>
                  </select>
                </div>
              </div>
              <div>
                <p style={{ fontSize: "20px" }}>已選攤位：{selectedVendors}</p>
              </div>
              <div>
                <p className="" style={{ fontSize: "20px" }}>
                  攤位價格：{vendorsPrice[`${selectedVendors}`]}元/天
                </p>
              </div>
              <div>
                <p className="" style={{ fontSize: "20px" }}>
                  租用天數：{rentDays}天(周一周二休市)
                </p>
              </div>
              <div className="form-dec">
                <span className="" style={{ fontSize: "20px" }}>
                  總計金額：{(vendorsPrice[`${selectedVendors}`] ? vendorsPrice[`${selectedVendors}`] * rentDays : 0).toLocaleString() || ""}元
                </span>
              </div>
              <div className="f-center mt-3">
                <button
                  className={`btn rounded-pill border border-3 ${styles.confirmbtn}`}
                  style={{ fontSize: "20px" }}
                  onClick={() => submitRentInfo(season, selectedVendors, user)}>
                  確定租用
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      <ChatBtn />
      <Footer />
    </div>
  );
};

export default SetStalls;
