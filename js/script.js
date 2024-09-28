document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const schoolInfoApiKey = 'e69b64ed5a784df5ac4eaf31f7ca00f9';
    const schoolAffiliationApiKey = 'ea4a63692b0c4c4591de85287cefd9d3';
    const schoolInfoApiUrl = 'https://open.neis.go.kr/hub/schoolInfo';
    const schoolAffiliationApiUrl = 'https://open.neis.go.kr/hub/schoolAflcoinfo';

    const fetchSchools = async () => {
        try {
            const region = document.getElementById('region').value;
            const schoolName = document.getElementById('schoolName').value;

            const schoolInfoParams = new URLSearchParams({
                KEY: schoolInfoApiKey,
                Type: 'json',
                pIndex: 1,
                pSize: 100,
                ATPT_OFCDC_SC_CODE: region,
                SCHUL_NM: schoolName,
                SCHUL_KND: '04',
            });
            const schoolInfoResponse = await fetch(`${schoolInfoApiUrl}?${schoolInfoParams}`);
            const schoolInfoData = await schoolInfoResponse.json();
            const schools = schoolInfoData?.schoolInfo?.[1]?.row || [];

            const resultList = await Promise.all(schools.map(async (school) => {
                const schoolAffiliationParams = new URLSearchParams({
                    KEY: schoolAffiliationApiKey,
                    Type: 'json',
                    pIndex: 1,
                    pSize: 100,
                    ATPT_OFCDC_SC_CODE: region,
                    SD_SCHUL_CODE: school.SD_SCHUL_CODE,
                });
                const schoolAffiliationResponse = await fetch(`${schoolAffiliationApiUrl}?${schoolAffiliationParams}`);
                const schoolAffiliationData = await schoolAffiliationResponse.json();
                const affiliations = schoolAffiliationData?.schoolAflcoinfo?.[1]?.row || [];
                const affiliationNames = affiliations.map(item => item.ORD_SC_NM).join(', ');

                return {
                    name: school.SCHUL_NM,
                    location: school.ORG_RDNMA,
                    phoneNumber: school.ORG_TELNO,
                    affiliations: affiliationNames || '정보 없음',
                };
            }));

            renderSchoolList(resultList);
        } catch (error) {
            console.error('API 요청 중 오류가 발생했습니다:', error);
        }
    };

    const renderSchoolList = (schools) => {
        const schoolList = document.getElementById('schoolList');
        schoolList.innerHTML = '';

        if (schools.length === 0) {
            schoolList.textContent = '검색 결과가 없습니다.';
            return;
        }

        schools.forEach(school => {
            const schoolInfoElement = document.createElement('div');
            schoolInfoElement.classList.add('bg-white', 'p-4', 'rounded', 'shadow-md', 'mb-4');

            const createElement = (text, className) => {
                const element = document.createElement('div');
                element.textContent = text;
                element.classList.add('mb-2', className);
                return element;
            };

            schoolInfoElement.appendChild(createElement('학교 이름: ' + school.name, 'font-bold'));
            schoolInfoElement.appendChild(createElement('위치: ' + school.location));
            schoolInfoElement.appendChild(createElement('학교 계열명: ' + school.affiliations));
            schoolInfoElement.appendChild(createElement('전화번호: ' + school.phoneNumber));

            schoolList.appendChild(schoolInfoElement);
        });
    };

    searchButton.addEventListener('click', fetchSchools);
});
