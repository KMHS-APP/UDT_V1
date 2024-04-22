document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');

    // API 요청을 위한 필요한 정보
    const schoolInfoApiKey = 'e69b64ed5a784df5ac4eaf31f7ca00f9'; // 학교 정보 API 키
    const schoolAffiliationApiKey = 'ea4a63692b0c4c4591de85287cefd9d3'; // 학교 계열 정보 API 키
    const schoolInfoApiUrl = 'https://open.neis.go.kr/hub/schoolInfo'; // 학교 정보 API 엔드포인트 URL
    const schoolAffiliationApiUrl = 'https://open.neis.go.kr/hub/schoolAflcoinfo'; // 학교 계열 정보 API 엔드포인트 URL

    // API 요청 함수
    async function fetchSchools() {
        try {
            const region = document.getElementById('region').value;
            const schoolName = document.getElementById('schoolName').value;

            // 학교 정보 API 호출
            const schoolInfoParams = {
                KEY: schoolInfoApiKey,
                Type: 'json',
                pIndex: 1,
                pSize: 100,
                ATPT_OFCDC_SC_CODE: region,
                SCHUL_NM: schoolName,
                SCHUL_KND: '04', // 고등학교 코드
            };
            const schoolInfoResponse = await fetch(`${schoolInfoApiUrl}?${new URLSearchParams(schoolInfoParams)}`);
            const schoolInfoData = await schoolInfoResponse.json();
            const schools = schoolInfoData?.schoolInfo?.[1]?.row || [];

            // 학교 계열 정보 API 호출 및 처리
            const resultList = await Promise.all(schools.map(async (school) => {
                const schoolAffiliationParams = {
                    KEY: schoolAffiliationApiKey,
                    Type: 'json',
                    pIndex: 1,
                    pSize: 100,
                    ATPT_OFCDC_SC_CODE: region,
                    SD_SCHUL_CODE: school.SD_SCHUL_CODE,
                };
                const schoolAffiliationResponse = await fetch(`${schoolAffiliationApiUrl}?${new URLSearchParams(schoolAffiliationParams)}`);
                const schoolAffiliationData = await schoolAffiliationResponse.json();
                const affiliations = schoolAffiliationData?.schoolAflcoinfo?.[1]?.row || [];
                const affiliationNames = affiliations.map(item => item.ORD_SC_NM).join(', ');

                return {
                    name: school.SCHUL_NM,
                    location: school.ORG_RDNMA,
                    type: affiliationNames || '정보 없음', // 학교 유형을 학교 계열명으로 설정
                    phoneNumber: school.SCHUL_TELNO,
                    affiliations: affiliationNames,
                };
                
            }));

            renderSchoolList(resultList);
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
            typeElement.textContent = '학교 구분: ' + school.type;

            const affiliationsElement = document.createElement('div');
            affiliationsElement.textContent = '학교 계열명: ' + school.affiliations;

            const phoneNumberElement = document.createElement('div');
            phoneNumberElement.textContent = '전화번호: ' + school.phoneNumber;

            schoolInfoElement.appendChild(nameElement);
            schoolInfoElement.appendChild(locationElement);
            schoolInfoElement.appendChild(typeElement);
            schoolInfoElement.appendChild(affiliationsElement);
            schoolInfoElement.appendChild(phoneNumberElement);

            schoolList.appendChild(schoolInfoElement);
        });
    }

    // 검색 버튼 클릭 시 API 요청 실행
    searchButton.addEventListener('click', fetchSchools);
});
