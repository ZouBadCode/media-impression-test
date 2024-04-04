from flask import Flask, jsonify, render_template, session, request,send_from_directory, redirect
import os
import random
import json
import urllib.parse
from datetime import datetime


gen_count = 0
app = Flask(__name__)
app.secret_key = 'your_secret_key'  # 設定一個密鑰用於保護 session

@app.route('/')
def main():
    return render_template('main.html')


@app.route('/video')
def video():
    if 'user_id' not in session:
        session['user_id'] = generate_unique_id()
        session['current_video_index'] = 0  # 初始化影片位置
        video_sequence = generate_random_video_sequence()
        save_video_sequence_to_json(session['user_id'], video_sequence)
    else:
        # 從 JSON 文件讀取用戶的影片序列
        video_sequence = read_video_sequence_from_json(session['user_id'])
        if not video_sequence:
            # 如果找不到序列，重新生成
            video_sequence = generate_random_video_sequence()
            save_video_sequence_to_json(session['user_id'], video_sequence)

    return render_template('video.html')

@app.route('/video_mobile')
def video_mobile():
    if 'user_id' not in session:
        session['user_id'] = generate_unique_id()
        session['current_video_index'] = 0  # 初始化影片位置
        video_sequence = generate_random_video_sequence()
        save_video_sequence_to_json(session['user_id'], video_sequence)
    else:
        # 從 JSON 文件讀取用戶的影片序列
        video_sequence = read_video_sequence_from_json(session['user_id'])
        if not video_sequence:
            # 如果找不到序列，重新生成
            video_sequence = generate_random_video_sequence()
            save_video_sequence_to_json(session['user_id'], video_sequence)

    return render_template('video_mobile.html')

def generate_unique_id():
    global gen_count
    gen_count =gen_count + 1
    gen_count_id_str = str(gen_count)
    time_gen = datetime.now().strftime("%Y%m%d%H%M%S%f")
    print(gen_count_id_str)
    time_gen_plus = time_gen + gen_count_id_str
    return time_gen_plus

def generate_random_video_sequence():
    # 假設您的影片都在 'videos' 資料夾中
    base_dir = os.path.abspath(os.path.dirname(__file__))
    videos_path = os.path.join(base_dir, 'static', 'videos')
    videos = os.listdir(videos_path)
    random.shuffle(videos)  # 打亂影片順序
    return videos

def save_video_sequence_to_json(user_id, video_sequence):
    # 儲存影片序列到 JSON 檔案
    data = {
        'user_id': user_id,
        'video_sequence': video_sequence
    }

    # 確保 user_sequences 資料夾存在
    user_sequences_dir = 'user_sequences'
    if not os.path.exists(user_sequences_dir):
        os.makedirs(user_sequences_dir)

    # 儲存 JSON 檔案
    with open(f'{user_sequences_dir}/{user_id}.json', 'w') as file:
        json.dump(data, file)



@app.route('/next-video')
def next_video():
    # 使用絕對路徑
    base_dir = os.path.abspath(os.path.dirname(__file__))
    videos_path = os.path.join(base_dir, 'static', 'videos')
    videos = os.listdir(videos_path)
    selected_video = random.choice(videos)
    video_url = f'/static/videos/{selected_video}'
    return jsonify({'videoUrl': video_url})

@app.route('/get-video', methods=['GET'])
def get_video():
    direction = request.args.get('direction', 'next')  # 從請求中獲取方向
    user_id = session['user_id']
    video_sequence = read_video_sequence_from_json(user_id)
    current_index = session.get('current_video_index', 0)

    if direction == 'next':
        current_index = min(current_index + 1, len(video_sequence) - 1)
    elif direction == 'previous':
        current_index = max(current_index - 1, 0)



    session['current_video_index'] = current_index
    video_url = f'/static/videos/{video_sequence[current_index]}'
    return jsonify({'videoUrl': video_url})


def read_video_sequence_from_json(user_id):
    try:
        with open(f'user_sequences/{user_id}.json', 'r') as file:
            data = json.load(file)
            return data['video_sequence']
    except FileNotFoundError:
        return None

@app.route('/record-action', methods=['POST'])
def record_action():
    data = request.json
    user_id = session.get('user_id', 'unknown_user')

    file_path = f'view_data/{user_id}.json'
    if not os.path.exists('view_data'):
        os.makedirs('view_data')

    # 檢查檔案是否存在，如果不存在，則創建一個新檔案並寫入一個空列表
    if not os.path.exists(file_path):
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write("[]")

    # 讀取現有數據，追加新數據，然後重新寫入檔案
    with open(file_path, 'r+', encoding='utf-8') as file:
        file_content = file.read()
        file.seek(0)  # 重設檔案指標到開頭
        user_data = json.loads(file_content) if file_content else []

        user_data.append(data)  # 將新數據追加到列表中

        # 將更新後的列表重新寫入檔案
        json.dump(user_data, file,ensure_ascii=False, indent=4)
        file.truncate()  # 刪除舊數據

    return 'Action recorded', 200

@app.route('/like', methods=['POST'])
def like():
    data = request.json
    video_name = data['videoName']
    user_id = session['user_id']

    like_data = load_like_data()
    user_likes = like_data.get(user_id, {})
    
    if video_name not in user_likes:
        user_likes[video_name] = True
        like_data[user_id] = user_likes
        save_like_data(like_data)
        return jsonify({'status': 'liked'})
    else:
        del user_likes[video_name]
        like_data[user_id] = user_likes
        save_like_data(like_data)
        user_likes[video_name] = True
        like_data[user_id] = user_likes
        save_like_data(like_data)
        return jsonify({'status': 'already liked'})
    
def load_like_data():
    if os.path.exists('view_data/like.json'):
        with open('view_data/like.json', 'r') as file:
            content = file.read().strip()
            if content:  # 檢查文件是否為空
                return json.loads(content)
            else:
                return {}  # 如果文件為空，則返回一個空字典
    return {}

def save_like_data(data):
    if not os.path.exists('view_data'):
        os.makedirs('view_data')
    with open('view_data/like.json', 'w') as file:
        json.dump(data, file)

@app.route('/check-like', methods=['GET'])
def check_like():
    video_name_utf8 = request.args.get('videoName')
    video_name = urllib.parse.quote(video_name_utf8)
    if video_name:
        print(video_name)
    user_id = session['user_id']

    like_data = load_like_data()
    user_likes = like_data.get(user_id, {})
    is_liked = user_likes.get(video_name)
    if is_liked is True:
        is_liked = True
    else:
        is_liked = False
    return jsonify({'isLiked': is_liked})

def load_like_data():
    if os.path.exists('view_data/like.json'):
        with open('view_data/like.json', 'r') as file:
            content = file.read().strip()
            if content:  # 檢查文件是否為空
                return json.loads(content)
            else:
                return {}  # 如果文件為空，則返回一個空字典
    return {}

@app.route('/unlike', methods=['POST'])
def unlike():
    data = request.json
    video_name = data['videoName']
    user_id = session['user_id']

    like_data = load_like_data()
    user_likes = like_data.get(user_id, {})
    
    if video_name in user_likes:
        del user_likes[video_name]
        like_data[user_id] = user_likes
        save_like_data(like_data)
        user_likes[video_name] = False
        like_data[user_id] = user_likes
        save_like_data(like_data)
        return jsonify({'status': 'unliked'})
    else:
        return jsonify({'status': 'not liked yet'})

def load_like_data():
    if os.path.exists('view_data/like.json'):
        with open('view_data/like.json', 'r') as file:
            content = file.read().strip()
            if content:  # 檢查文件是否為空
                return json.loads(content)
            else:
                return {}  # 如果文件為空，則返回一個空字典
    return {}

def save_like_data(data):
    if not os.path.exists('view_data'):
        os.makedirs('view_data')
    with open('view_data/like.json', 'w') as file:
        json.dump(data, file)



@app.route('/image/<filename>')
def get_image(filename):
    image_directory = 'C:/Users/User/Desktop/web for short/short/web/backend/image'
    return send_from_directory(image_directory, filename)

@app.route('/thumbnail/random/<filename>')
def get_image_r(filename):
    image_directory = 'C:/Users/User/Desktop/web for short/short/web/backend/thumbnail/random'
    return send_from_directory(image_directory, filename)

@app.route('/thumbnail/target/<filename>')
def get_image_t(filename):
    image_directory = 'C:/Users/User/Desktop/web for short/short/web/backend/thumbnail/target'
    return send_from_directory(image_directory, filename)





@app.route('/thumbnail')
def render_thumbnail_test():
    return render_template("thumbnail.html")

@app.route('/get-thumbnail')
def get_images():
    # 讀取 JSON 檔案中的圖片資訊
    with open('C:/Users/User/Desktop/web for short/short/web/backend/json/thumbnail.json', 'r', encoding='utf-8') as file:
        images = json.load(file)
    
    # 篩選帶有 'random' 屬性的圖片
    random_images = [img for img in images if img['attribute'] == 'random']
    # 隨機選擇 10 張不重複的圖片
    selected_random_images = random.sample(random_images, 10)
    
    # 篩選帶有 'target' 屬性的圖片
    target_images = [img for img in images if img['attribute'] == 'target']
    # 隨機選擇 2 張不重複的圖片
    selected_target_images = random.sample(target_images, 2)
    
    # 將選擇的圖片結合起來
    selected_images = selected_random_images + selected_target_images
    # 隨機打亂最終的圖片順序
    random.shuffle(selected_images)
    print(selected_images)
    # 將資訊以 JSON 格式返回前端
    return jsonify(selected_images)


record_json_path = "C:/Users/User/Desktop/web for short/short/web/backend/json/record_thumbnail.json"
record_tag_path = "C:/Users/User/Desktop/web for short/short/web/backend/json/record_tag.json"
@app.route('/update_title_count', methods=['POST'])
def update_title_count():
    # 從POST請求中獲取title
    title = request.json.get('title')
    print(title)
    if not title:
        return jsonify({'error': 'No title provided'}), 400
    
    # 讀取現有的title計數(如果文件存在)
    if os.path.exists(record_json_path):
        with open(record_json_path, 'r', encoding='utf-8') as file: 
            titles_count = json.load(file)
    else:
        titles_count = {}
    
    # 更新計數
    if title in titles_count:
        titles_count[title] += 1
    else:
        titles_count[title] = 1
    
    # 將更新後的計數保存回文件
    with open(record_json_path, 'w', encoding='utf-8') as file:
        json.dump(titles_count, file, ensure_ascii=False)
    
    return jsonify({'message': 'Title count updated successfully'}), 200

@app.route('/update_tag_count', methods=['POST'])
def update_tag_count():
    # 從POST請求中獲取tag
    tag_String = request.json.get('tag')
    if not tag_String:
        return jsonify({'error': 'No title provided'}), 400
    
    tags = tag_String.split(',')

    # 讀取現有的tag計數(如果文件存在)
    if os.path.exists(record_tag_path):
        with open(record_tag_path, 'r', encoding='utf-8') as file: 
            tag_count = json.load(file)
    else:
        tag_count = {}
    
    # 更新計數
    for tag in tags:
        tag = tag.strip()
        if tag:
            if tag in tag_count:
                tag_count[tag] += 1
            else:
                tag_count[tag] = 1
    
    # 將更新後的計數保存回文件
    with open(record_tag_path, 'w', encoding='utf-8') as file:
        json.dump(tag_count, file, ensure_ascii=False)
    
    return jsonify({'message': 'Tag count updated successfully'}), 200


@app.route('/again')
def again():
    return render_template("again.html")

@app.route('/get-result', methods=['GET'])
def get_data():
    with open('C:/Users/User/Desktop/web for short/short/web/backend/json/record_thumbnail.json', 'r', encoding='utf-8') as file:
        data = json.load(file)
    return jsonify(data)

@app.route('/get-tag_data', methods=['GET'])
def get_tag_data_chart():
    with open('C:/Users/User/Desktop/web for short/short/web/backend/json/record_tag.json', 'r', encoding='utf-8') as file:
        data = json.load(file)
    return jsonify(data)

@app.route('/show-result')
def render_result():
    return render_template("result-data.html")

@app.route('/show-result-tag')
def render_result_tag():
    return render_template("tag_chart.html")

@app.route('/tran-image-title', methods=['GET'])
def tran_image_title():
    images_data = load_images_data()  # 載入圖片資料
    if not isinstance(images_data, list):
        print("Error: Data is not a list")
    for item in images_data:
        if not isinstance(item, dict):
            print("Error: Item is not a dictionary")
            continue
    title_query = request.args.get('title', default='', type=str)

    for image in images_data:
        if image['title'] == title_query:
            return redirect(image['path'], code=302)

    return jsonify({"error": "Image not found"}), 404

# 讀取 JSON 檔案並儲存資料
def load_images_data():
    try:
        with open('C:/Users/User/Desktop/web for short/short/web/backend/json/thumbnail.json', 'r', encoding='utf-8') as file:
            data = json.load(file)
            if isinstance(data, list):  # 確保讀取到的是列表
                return data
            else:
                print("Error: Data is not a list")
                return []
    except Exception as e:
        print(f"Error reading the JSON file: {e}")
        return []

if __name__ == '__main__':
    app.run(host='localhost', port= 25565, debug=True)
