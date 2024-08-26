import React,  { useEffect, useState }from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import styles from "./MarketFloorPlanB.module.scss";


const MarketFloorPlan = ({fetchData, season_data, selectedPeriod}) => {
  const [selectedStalls, setSelectedStalls] = useState(new Set());
  const [lastClickedElement, setLastClickedElement] = useState(null);
  console.log(season_data);
  const getBoothClass = (booth) => {
    if (season_data.includes(booth)) {
      return "bg-select-gray";
    }else if (["A01", "A02", "B01", "B02", "C01", "C02", "D01", "D02"].includes(booth)) {
      return "bg-red";
    }return "bg-secondary";
  };
  const handleClick = (event) => {
    const element = event.target;
    console.log(lastClickedElement);
    console.log(element);

    //更新上次點擊的元素的狀態
    setLastClickedElement((preLastClickedElement) => {
      if(preLastClickedElement && preLastClickedElement !== element) {
        preLastClickedElement.classList.remove("bg-lightBlue");
        if (preLastClickedElement.dataset.originalClass === "bg-red") {
          preLastClickedElement.classList.add("bg-red");
        }else {
          preLastClickedElement.classList.add("bg-secondary");
        }
      }
      return element;
    })

    //更新當前點擊元素的狀態
    if(element.classList.contains("bg-lightBlue")) {
      //如果已經是bg-lightBlue，則恢復originalClass
      element.classList.remove("bg-lightBlue");
      if(element.dataset.originalClass  === "bg-red") {
        element.classList.add("bg-red");
      }else {
        element.classList.add("bg-secondary");
      }
      setSelectedStalls((prevStalls) => {
        const newStalls = new Set(prevStalls);
        newStalls.delete(vendors);
        fetchData(''); //清空父元件資料
        return newStalls;
      });
    }else {
      element.dataset.originalClass = element.classList.contains("bg-red") ? "bg-red" : "bg-secondary";
      element.classList.remove("bg-red", "bg-secondary");
      element.classList.add("bg-lightBlue")
      setSelectedStalls((prevStalls) => {
        const newStalls = new Set(prevStalls);
        newStalls.add(vendors);
        fetchData(vendors); //更新父元件資料
        return newStalls;
      });
    }
    const vendors = element.innerText;
    const newSelectedStalls = new Set(selectedStalls);
  };
  const position = ["A", "B", "C", "D"];
  const vendor_unmber = ["01", "02", "03", "04", "05"];
  //切換季度時還原已選攤位的顏色
  useEffect(() => {
    const reColor =  document.querySelectorAll('#vendorPosition');
    reColor.forEach(element => {
      if(element.classList.contains("bg-lightBlue")) {
        //如果已經是bg-lightBlue，則恢復originalClass
        element.classList.remove("bg-lightBlue");
        if(element.dataset.originalClass  === "bg-red") {
          element.classList.add("bg-red");
        }else {
          element.classList.add("bg-secondary");
        }}
    });
  },[selectedPeriod])
  return (
    <Container fluid className={styles.containerSize}>
              <div className="d-flex justify-content-evenly">
                <div className="d-flex align-items-center">
                  <div
                    className="bg-lightBlue me-2"
                    style={{ width: "20px", height: "20px" }}
                  ></div>
                  <span>已選攤位</span>
                </div>
                <div className="d-flex align-items-center">
                  <div
                    className="bg-gray me-2"
                    style={{ width: "20px", height: "20px" }}
                  ></div>
                  <span>已出租</span>
                </div>
              </div>
      <hr />        
      <Row className={styles.floorPlanRow}>
        <Col>
          <div className={styles.floorPlan}>
            <div className={styles.mainStage}>主舞台</div>
            {[...Array(4)].map((_, rowIndex) => (
              <div
                key={rowIndex}
                className={styles.stallRow}
                style={{ top: `${20 + rowIndex * 20}%` }} 
                >
                {[...Array(5)].map((_, colIndex) => (
                  <div 
                  key={colIndex}
                  id="vendorPosition" 
                  className={`${styles.stall} ${getBoothClass(position[rowIndex] + vendor_unmber[colIndex])}`}
                  onClick={handleClick}
                  >
                    {position[rowIndex] + vendor_unmber[colIndex]}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Col>
      </Row>
      <br />
      <Row className={styles.footer}>
      </Row>
    </Container>
  );
};

export default MarketFloorPlan;
