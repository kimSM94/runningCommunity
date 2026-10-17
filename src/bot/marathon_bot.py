import sys
import os
import time
import re
from datetime import datetime
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import requests

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

sys.stdout.reconfigure(encoding='utf-8')

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, "../../"))
env_path = os.path.join(root_dir, ".env.local")
load_dotenv(env_path)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("VITE_SUPBASE_KEY")

def scrape_and_save():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("🚨 에러: 환경변수를 찾지 못했습니다!")
        return

    print("🏃‍♂️ '마라톤고' 전체 리스트 및 상세 페이지 데이터 싹쓸이를 시작합니다...")
    print("⏳ 상세 페이지를 하나씩 방문하므로 1~2분 정도 소요됩니다. 터미널을 끄지 말고 기다려주세요!\n")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless") 
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("user-agent=Mozilla/5.0")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    # ==========================================
    # 1. 메인 리스트에서 기본 정보 긁어오기
    # ==========================================
    driver.get("https://marathongo.co.kr/raceSchedule/domestic")
    time.sleep(2)

    while True:
        try:
            more_btn = driver.find_element(By.XPATH, "//button[contains(., '더 보기')]")
            driver.execute_script("arguments[0].click();", more_btn)
            time.sleep(1.5)
        except:
            print("✅ 전체 리스트 로딩 완료! 상세 페이지 분석을 시작합니다.\n")
            break

    main_soup = BeautifulSoup(driver.page_source, 'html.parser')
    events = main_soup.select('a[href^="/raceDetail/domestic/"]')
    
    today = datetime.now().date()
    current_year = today.year
    scraped_data = []

    # 임시 리스트에 기본 정보 먼저 저장
    temp_events = []
    for a_tag in events:
        try:
            link = "https://marathongo.co.kr" + a_tag['href']
            texts = list(a_tag.stripped_strings)
            if not texts: continue

            full_text = " ".join(texts)
            status = "정보없음"
            if "접수중" in full_text: status = "접수중"
            elif "접수마감" in full_text: status = "접수마감"
            elif "접수예정" in full_text: status = "접수예정"

            date_match = re.search(r'(\d{1,2})\s*[.월]\s*(\d{1,2})\s*[.일]?', full_text)
            if not date_match: continue
            
            month, day = int(date_match.group(1)), int(date_match.group(2))
            year = current_year if month >= today.month else current_year + 1
            event_date_obj = datetime(year, month, day).date()
            d_day = (event_date_obj - today).days

            if d_day < 0: continue

            title = "대회명 정보없음"
            for txt in texts:
                txt_clean = txt.strip()
                if re.search(r'\d{1,2}[월.]\s*\d{1,2}[일.]?', txt_clean): continue
                if re.match(r'^\(?[월화수목금토일]\)?$', txt_clean): continue
                if re.search(r'\d{1,3}(km|k|m)', txt_clean, re.IGNORECASE) or txt_clean in ["하프", "풀", "Half", "Full"]: continue
                if txt_clean in ["접수중", "접수마감", "접수예정"]: continue
                
                # 💡 [추가된 부분] 쓸데없는 카테고리 태그 무시하기
                if "조깅" in txt_clean or "경보" in txt_clean: continue
                
                if len(txt_clean) > 2:
                    title = txt_clean
                    break
            
            temp_events.append({
                "title": title, "event_date": str(event_date_obj), "d_day": d_day, 
                "status": status, "link": link
            })
        except:
            continue

    # 중복 제거 (MUI 특성상 동일 링크가 여러 개 잡힐 수 있음)
    unique_events = {v['link']:v for v in temp_events}.values()

    # ==========================================
    # 2. 브라우저가 직접 상세 페이지(URL)로 하나씩 이동하며 데이터 수집
    # ==========================================
    for idx, event in enumerate(unique_events):
        try:
            # 💡 [핵심] 셀레니움 브라우저가 직접 상세 페이지로 들어가서 1.5초 대기 (데이터가 뜰 때까지 기다림)
            driver.get(event['link'])
            time.sleep(1.5) 
            
            detail_soup = BeautifulSoup(driver.page_source, 'html.parser')
            detail_strings = [text.strip() for text in detail_soup.stripped_strings if text.strip()]
            
            location = "장소 미정"
            event_time = "시간 미정"
            reg_period = "기간 미정"
            description = ""
            apply_url = event['link']
            
            # 페이지 안의 모든 글자들을 검사해서 장소/시간/기간/소개내용 뽑아내기
            for i, s in enumerate(detail_strings):
                if s == "장소" and i + 1 < len(detail_strings):
                    location = detail_strings[i+1][:50]
                elif s == "시간" and i + 1 < len(detail_strings):
                    event_time = detail_strings[i+1][:50]
                elif s == "접수 기간" and i + 1 < len(detail_strings):
                    reg_period = detail_strings[i+1][:50]
                elif s == "소개내용" and i + 1 < len(detail_strings):
                    desc_parts = []
                    for j in range(i+1, min(i+10, len(detail_strings))):
                        if detail_strings[j] in ["문의처", "주최", "주관", "전문 러닝화 선택", "신청하기"]: break
                        desc_parts.append(detail_strings[j])
                    description = " ".join(desc_parts)[:1000]

            # 진짜 대회 공식 '신청하기' URL 찾기
            for a in detail_soup.find_all('a', href=True):
                btn_text = a.text.replace(" ", "")
                if "신청하기" in btn_text or "홈페이지" in btn_text:
                    apply_url = a['href']
                    break

            # 기존 기본 정보에 상세 정보 합치기
            event.update({
                "location": location,
                "apply_url": apply_url,
                "event_time": event_time,
                "reg_period": reg_period,
                "description": description
            })
            scraped_data.append(event)
            print(f"✅ [{idx+1}] {event['title']} (📍{location[:10]} | 🔗{apply_url[:20]}...)")
            
        except Exception as e:
            continue

    driver.quit()

    # ==========================================
    # 3. DB 저장
    # ==========================================
    if scraped_data:
        try:
            print(f"\n🚀 DB 저장을 시작합니다... (총 {len(scraped_data)}개)")
            api_url = f"{SUPABASE_URL}/rest/v1/marathons"
            db_headers = {
                "apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json", "Prefer": "return=minimal"
            }
            requests.delete(api_url + "?id=not.eq.0", headers=db_headers)
            res = requests.post(api_url, headers=db_headers, json=scraped_data)
            
            if res.status_code in [200, 201]:
                print(f"🎉 대성공! 장소와 찐 신청 링크가 포함된 일정이 DB에 저장되었습니다!")
            else:
                print(f"🚨 DB 저장 실패: {res.text}")
        except Exception as e:
            print("\n🚨 통신 에러 발생:", str(e))

if __name__ == "__main__":
    scrape_and_save()