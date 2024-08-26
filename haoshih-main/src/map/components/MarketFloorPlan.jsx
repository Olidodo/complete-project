import {useEffect, useState} from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import styles from "./MarketFloorPlan.module.scss";

const MarketFloorPlan = ({fetchData, setVendorNumber}) => {
 
  const handleClick = (event) => {
    const letter_map = {
      'A': 1,
      'B': 2,
      'C': 3,
      'D': 4
    };  
    //定義攤位區域碼文字對應數字
    const number_to_vinfo = event.target.innerText 
    const letter = number_to_vinfo.charAt(0);  //取得文字部分
    const number = parseInt(number_to_vinfo.slice(1));  //取得數字部分，從索引1開始
    const vinfo = (letter_map[letter] - 1) * 5 + number;
    console.log(vinfo);
    console.log(number_to_vinfo);
    setVendorNumber(number_to_vinfo)
    fetchData(vinfo);
  };
  const position = ["A", "B", "C", "D"];
  const vendor_unmber = ["01", "02", "03", "04", "05"];
  //每個設施點擊切換的同時須關閉其餘設施
  const find_toilet = () => {  
    var toilets = document.querySelectorAll('.toilet');
    var bench = document.querySelectorAll('.bench');
    var trash = document.querySelectorAll('.trash');
    toilets.forEach((toilet) => {
      toilet.classList.toggle(`${styles.toiletOnClick}`);
    })
    bench.forEach((bench) => {
      if(bench.classList.contains(styles.benchOnClick)) {
        bench.classList.remove(styles.benchOnClick);
      }
    })
    trash.forEach((trash) => {
      if(trash.classList.contains(styles.trashOnClick)) {
        trash.classList.toggle(styles.trashOnClick);
      }
    })
  }
  const find_bench = () => {
    var toilets = document.querySelectorAll('.toilet');
    var bench = document.querySelectorAll('.bench');
    var trash = document.querySelectorAll('.trash');
    bench.forEach((bench) => {
      bench.classList.toggle(`${styles.benchOnClick}`);
    })
    toilets.forEach((toilet) => {
      if(toilet.classList.contains(styles.toiletOnClick)) {
        toilet.classList.remove(styles.toiletOnClick);
      }
    })
    trash.forEach((trash) => {
      if(trash.classList.contains(styles.trashOnClick)) {
        trash.classList.remove(styles.trashOnClick);
      }
    })
  }
  const find_trash = () => {
    var toilets = document.querySelectorAll('.toilet');
    var bench = document.querySelectorAll('.bench');
    var trash = document.querySelectorAll('.trash');
    trash.forEach((trash) => {
      trash.classList.toggle(`${styles.trashOnClick}`);
    })
    toilets.forEach((toilet) => {
      if(toilet.classList.contains(styles.toiletOnClick)) {
        toilet.classList.remove(styles.toiletOnClick);
      }
    })
    bench.forEach((bench) => {
      if(bench.classList.contains(styles.benchOnClick)) {
        bench.classList.remove(styles.benchOnClick);
      }
    })
  }
  return (
    <Container fluid className={styles.containerSize}>
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
                  <div key={colIndex} 
                  className={`${styles.stall} ${styles.hover}`}
                  onClick={handleClick}
                  >
                    {position[rowIndex] + vendor_unmber[colIndex]}
                  </div>
                ))}
              </div>
            ))}
            <div>
              <div>
                <span
                  className={`${styles.dot2} ${styles.dotYellow} toilet`}
                  style={{ left: "5%", top: "10%" }}
                />
                <span
                  className={`${styles.dot2} ${styles.dotBlue} trash`}
                  style={{ left: "5%", bottom: "10%" }}
                />
                <span
                  className={`${styles.dot2} ${styles.dotYellow} toilet`}
                  style={{ right: "5%", bottom: "10%" }}
                />
              </div>
            </div>

            {[...Array(3)].map((_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${styles.dotRed} bench`}
                style={{ left: `${30 + index * 20}%`, top: "10%" }}
              />
            ))}
            {[...Array(3)].map((_, index) => (
              <span
                key={index}
                className={`${styles.dot2} ${styles.dotRed} bench`}
                style={{ left: `${30 + index * 20}%`, bottom: "10%" }}
              />
            ))}
          </div>
        </Col>
      </Row>
      <br />
      <Row className={styles.footer}>
        <Col>
          <div className="f-end fs-5 c-gray">點擊尋找 → </div>
        </Col>
        <Col xs="auto" className="d-flex gap-3">
          <Button
            size="sm"
            className={`bg-secondary border-0 ${styles.iconButton}`}
            onClick={find_toilet}
          >
            <img src="images/icon/Toilet.png" alt="" />
          </Button>
          <Button 
            size="sm" 
            className={`bg-pink border-0 ${styles.iconButton}`}
            onClick={find_bench}>
            <img src="images/icon/Bench.png" alt="" />
          </Button>
          <Button 
            size="sm" 
              className={`bg-lake border-0 ${styles.iconButton}`}
              onClick={find_trash}> 
            <img src="images/icon/Trash.png" alt=""/>
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default MarketFloorPlan;
