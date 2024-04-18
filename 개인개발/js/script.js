document.addEventListener('DOMContentLoaded', function () {
  const searchButton = document.getElementById('searchButton');

  // API 요청을 위한 필요한 정보
  const schoolInfoApiKey = 'e69b64ed5a784df5ac4eaf31f7ca00f9'; // 학교 정보 API 키
  const schoolAffiliationApiKey = 'ea4a63692b0c4c4591de85287cefd9d3'; // 학교 계열 정보 API 키
  const schoolInfoApiUrl = 'https://open.neis.go.kr/hub/schoolInfo'; // 학교 정보 API 엔드포인트 URL
  const schoolAffiliationApiUrl = 'https://open.neis.go.kr/hub/schoolSpecial'; // 학교 계열 정보 API 엔드포인트 URL

  // API 요청 함수
  async function fetchSchools() {
      try {
          const region = document.getElementById('region').value;
          const schoolType = document.getElementById('schoolType').value;

          const schoolInfoParams = {
              KEY: schoolInfoApiKey,
              Type: 'json',
              pIndex: 1,
              pSize: 100,
              ATPT_OFCDC_SC_CODE: region,
              SCHUL_KND: '04', // 고등학교 코드
          };

          const schoolAffiliationParams = {
              KEY: schoolAffiliationApiKey,
              Type: 'json',
              pIndex: 1,
              pSize: 100,
              ATPT_OFCDC_SC_CODE: region,
              ACH_GBN: '02', // 학교유형코드 (02: 고등학교)
          };

          const schoolInfoResponse = await fetch(`${schoolInfoApiUrl}?${new URLSearchParams(schoolInfoParams)}`);
          const schoolInfoData = await schoolInfoResponse.json();

          const schools = schoolInfoData?.schoolInfo?.[1]?.row || [];

          const resultList = await Promise.all(schools.map(async (school) => {
              schoolAffiliationParams.SD_SCHUL_CODE = school.SD_SCHUL_CODE; // 학교 코드 설정
              const schoolAffiliationResponse = await fetch(`${schoolAffiliationApiUrl}?${new URLSearchParams(schoolAffiliationParams)}`);
              const schoolAffiliationData = await schoolAffiliationResponse.json();
              const affiliations = schoolAffiliationData?.schoolSpecial?.[1]?.row || [];
              const schoolTypes = affiliations.map(item => item.ORD_SC_NM);

              return {
                  name: school.SCHUL_NM,
                  location: school.ORG_RDNMA,
                  type: schoolTypes.includes(schoolType) ? schoolType : null, // 학교 유형은 선택한 값과 일치하면 설정, 일치하지 않으면 null
                  phoneNumber: school.SCHUL_TELNO,
                  schoolTypes: schoolTypes
              };
          }));

          const filteredList = resultList
              .filter(school => school.name.includes(document.getElementById('schoolName').value)) // 학교 이름 필터링
              .filter(school => school.location.includes(region)); // 교육청 필터링

          // schoolType이 "none"이 아닌 경우에만 필터링
          if (schoolType !== "none") {
              filteredList = filteredList.filter(school => school.type !== null); // 학교 유형 필터링
          }

          renderSchoolList(filteredList);

      } catch (error) {
          console.error('API 요청 중 오류가 발생했습니다:', error);
      }
  }

  // 결과 화면에 학교 정보를 렌더링하는 함수
  function renderSchoolList(schools) {
      const schoolList = document.getElementById('schoolList');
      schoolList.innerHTML = '';

      if (schools.length === 0) {
          schoolList.textContent = '검색 결과가 없습니다.';
          return;
      }

      schools.forEach(school => {
          const schoolInfoElement = document.createElement('div');
          schoolInfoElement.classList.add('school-info');

          const nameElement = document.createElement('div');
          nameElement.textContent = '학교 이름: ' + school.name;

          const locationElement = document.createElement('div');
          locationElement.textContent = '위치: ' + school.location;

          const typeElement = document.createElement('div');
          typeElement.textContent = '학교 구분: ' + (school.type ? school.type : '정보 없음');

          const phoneNumberElement = document.createElement('div');
          phoneNumberElement.textContent = '전화번호: ' + school.phoneNumber;

          const schoolTypesElement = document.createElement('div');
          schoolTypesElement.textContent = '학교 유형: ' + school.schoolTypes.join(', ');

          schoolInfoElement.appendChild(nameElement);
          schoolInfoElement.appendChild(locationElement);
          schoolInfoElement.appendChild(typeElement);
          schoolInfoElement.appendChild(phoneNumberElement);
          schoolInfoElement.appendChild(schoolTypesElement);

          schoolList.appendChild(schoolInfoElement);
      });
  }

  // 검색 버튼 클릭 시 API 요청 실행
  searchButton.addEventListener('click', fetchSchools);
});
